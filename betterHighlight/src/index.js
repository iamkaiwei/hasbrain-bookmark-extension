const highlighter = require('./highlighter')
const rangeUtil = require('./range-util')
const xpathRange = require('./anchoring/range')
const anchoring = require('./anchoring/html');
const { normalizeURI } = require('./util/url')
const raf = require('raf')

const animationPromise = function(fn) {
  return new Promise(function(resolve, reject) {
    return raf(function() {
      try {
        return resolve(fn());
      } catch (error) {
        return reject(error);
      }
    });
  });
};

const locate = root => function(target) {
  console.log('TARGET in locate', target)
  if (!((target.selector || []).some((s) => s.type == 'TextQuoteSelector'))) {
    return Promise.resolve({
      // annotation: annotation,
      target: target
    });
  }
  const options = {
    ignoreSelector: '[class^="annotator-"]'
  };
  return anchoring.anchor(root, target.selector, options).then(function(range) {
    console.log('RANGE', range, 'ROOT', root)
    return {
      // annotation: annotation,
      target: target,
      range: range
    };
  })["catch"](function(err) {
    console.log('ERROR in get range', err, 'ROOT', root)
    return {
      // annotation: annotation,
      target: target
    };
  });
};

const highlight = root => function(anchor) {
  if (anchor.range == null) {
    return anchor;
  }
  return animationPromise(function() {
    var highlights, normedRange, range;
    range = xpathRange.sniff(anchor.range);
    normedRange = range.normalize(root);
    highlights = highlighter.highlightRange(normedRange);
    $(highlights).data('annotation', anchor.annotation);
    anchor.highlights = highlights;
    return anchor;
  });
};
class HighlightHelper {
  
  constructor() {
    this.anchors = []
    this.rangeUtil = rangeUtil
  }

  getSelectionFocusRect(_selection) {
    const selection = _selection || document.getSelection();
    return rangeUtil.selectionFocusRect(selection);
  }

  canCreateHighlightFromSelection(_selection) {
    const selection = _selection || document.getSelection();
    const isBackwards = this.rangeUtil.isSelectionBackwards(selection)
    const focusRect = this.rangeUtil.selectionFocusRect(selection)
    return !!focusRect;
  }

  saveRangeBeforeCreateHighlight(_selection) {
    const selection = _selection || document.getSelection();
    if (!selection.rangeCount || selection.getRangeAt(0).collapsed) {
      this.selectedRanges = [] 
    } else {
      this.selectedRanges = [selection.getRangeAt(0)];
    }
  }

  getBoundingRect(elements) {
    const rects = elements.filter(n => typeof n.getBoundingClientRect === "function").map(n =>n.getBoundingClientRect());
    return rects.reduce(function(acc, r) {
      return {
        top: Math.min(acc.top, r.top),
        left: Math.min(acc.left, r.left),
        bottom: Math.max(acc.bottom, r.bottom),
        right: Math.max(acc.right, r.right)
      };
    });
  }

  onHighlight() {
    // this.setVisibleHighlights(true);
    this.createHighlight();
    return document.getSelection().removeAllRanges();
  }
  createHighlight() {
    return this.createAnnotation({$highlight: true})
  }
  restoreHighlightFromTargets(targets) {
    const root = document.body
    console.log('TARGET IN RESTORE', targets)
    return Promise.all(targets.map(target => locate(root)(target).then(highlight(root)))).then(this.sync.bind(this))
  }
  createAnnotation(annotation = {}) {
    const root = document.body
    const ranges = this.selectedRanges || [];
    this.selectedRanges = null;
    const getSelectors = (root) => function(range) {
      var options;
      options = {
        ignoreSelector: '[class^="annotator-"]'
      };
      return anchoring.describe(root, range, options);
    };
    const setDocumentInfo = function(info) {
      annotation.document = info.metadata;
      return annotation.uri = info.uri;
    };
    const setTargets = function(arg) {
      var info, selector, selectors, source;
      info = arg[0], selectors = arg[1];
      source = info.uri;
      return annotation.targets = (function() {
        var i, len, results;
        results = [];
        for (i = 0, len = selectors.length; i < len; i++) {
          selector = selectors[i];
          results.push({
            source: source,
            selector: selector
          });
        }
        return results;
      })();
    };
    const info = this.getDocumentInfo();
    console.log('RANGES', ranges);
    const selectors = Promise.all(ranges.map(getSelectors(root)));
    const metadata = info.then(setDocumentInfo);
    const targets = Promise.all([info, selectors]).then(setTargets);
    return targets.then(() => this.anchor(annotation));
    // return annotation;
  }
  getDocumentInfo() {
    const href = decodeURIComponent(window.location.href);
    return Promise.resolve({
      uri: normalizeURI(href),
      metadata: {
        title: document.title,
        link: [{href: decodeURIComponent(window.location.href)}]
      }
    })
  }

  getAnchors() {
    return this.anchors;
  }

  sync(anchors){
    console.log('ANCHORS', anchors)
    let hasAnchorableTargets = false;
    let hasAnchoredTargets = false;
    for (let anchor of anchors) {
      if (anchor.target.selector != null) {
        hasAnchorableTargets = true;
        if (anchor.range != null) {
          hasAnchoredTargets = true;
          break;
        }
      }
    }
    this.anchors = this.anchors.concat(anchors);
    return anchors;
  };

  anchor(annotation) {
    const root = document.body
    const anchors = [];
    const anchoredTargets = [];
    let deadHighlights = [];
    if (annotation.targets == null) {
      annotation.targets = [];
    }
    
    
    
    const deletedAchors = this.anchors.splice(0, this.anchors.length);
    deletedAchors.forEach(anchor => {
      if (anchor.annotation === annotation) {
        if ((anchor.range != null) && (annotation.targets.indexOf(anchor.target) >= 0)) {
          anchors.push(anchor);
          anchoredTargets.push(anchor.target);
        } else if (anchor.highlights != null) {
          deadHighlights = deadHighlights.concat(anchor.highlights);
          delete anchor.highlights;
          delete anchor.range;
        }
      } else {
        this.anchors.push(anchor);
      }
    });
    raf(function() {
      return highlighter.removeHighlights(deadHighlights);
    });
    // console.log(JSON.stringify(annotation.targets));
    const withAnnotation = (value) => ({
      ...value,
      annotation
    });
    annotation.targets.forEach(target => {
      if ((anchoredTargets.indexOf(target) < 0)) {
        const anchor = locate(root)(target).then(withAnnotation).then(highlight(root));
        anchors.push(anchor);
      }
    });
    return Promise.all(anchors).then(this.sync.bind(this));
  }
}

module.exports = HighlightHelper
window.HighlightHelper = HighlightHelper