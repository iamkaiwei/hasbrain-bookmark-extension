highlighter = require('./highlighter')
rangeUtil = require('./range-util')
xpathRange = require('./anchoring/range')
rangeUtil = require('./range-util')
anchoring = require('./anchoring/html');
const { normalizeURI } = require('./util/url')
const raf = require('raf')

const animationPromise = function(fn) {
  return new Promise(function(resolve, reject) {
    return raf(function() {
      var error;
      try {
        return resolve(fn());
      } catch (_error) {
        error = _error;
        return reject(error);
      }
    });
  });
};
class HighlightHelper {
  
  constructor() {
    this.anchors = []
    this.rangeUtil = rangeUtil
  }

  getAnchoring() {
    return anchoring
  }

  onHighlight() {
    // this.setVisibleHighlights(true);
    this.createHighlight();
    return document.getSelection().removeAllRanges();
  }
  createHighlight() {
    return this.createAnnotation({$highlight: true})
  }
  createAnnotation(annotation) {
    var info, metadata, ranges, ref, ref1, selectors, self, setDocumentInfo, setTargets, targets;
    if (annotation == null) {
      annotation = {};
    }
    self = this;
    // root = this.element[0];
    const root = document.body
    ranges = (ref = this.selectedRanges) != null ? ref : [];
    this.selectedRanges = null;
    const getSelectors = (root) => function(range) {
      var options;
      options = {
        cache: self.anchoringCache,
        ignoreSelector: '[class^="annotator-"]'
      };
      return self.getAnchoring().describe(root, range, options);
    };
    setDocumentInfo = function(info) {
      annotation.document = info.metadata;
      return annotation.uri = info.uri;
    };
    setTargets = function(arg) {
      var info, selector, selectors, source;
      info = arg[0], selectors = arg[1];
      source = info.uri;
      return annotation.target = (function() {
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
    info = this.getDocumentInfo();
    console.log('RANGES', ranges);
    selectors = Promise.all(ranges.map(getSelectors(root)));
    metadata = info.then(setDocumentInfo);
    targets = Promise.all([info, selectors]).then(setTargets);
    // targets.then(function() {
    //   return self.publish('beforeAnnotationCreated', [annotation]);
    // });
    targets.then(function() {
      return self.anchor(annotation);
    });
    // if (!annotation.$highlight) {
    //   if ((ref1 = this.crossframe) != null) {
    //     ref1.call('showSidebar');
    //   }
    // }
    return annotation;
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
  anchor(annotation) {
    const self = this;
    // root = this.element[0];
    const root = document.body
    const anchors = [];
    const anchoredTargets = [];
    let deadHighlights = [];
    if (annotation.target == null) {
      annotation.target = [];
    }
    const locate = function(target) {
      var options, ref;
      if (!((ref = target.selector) != null ? ref : []).some((function(_this) {
        return function(s) {
          return s.type === 'TextQuoteSelector';
        };
      })(this))) {
        return Promise.resolve({
          annotation: annotation,
          target: target
        });
      }
      options = {
        cache: self.anchoringCache,
        ignoreSelector: '[class^="annotator-"]'
      };
      return self.getAnchoring().anchor(root, target.selector, options).then(function(range) {
        console.log('RANGE', range, 'ROOT', root)
        return {
          annotation: annotation,
          target: target,
          range: range
        };
      })["catch"](function(err) {
        console.log('ERROR in get range', err, 'ROOT', root)
        return {
          annotation: annotation,
          target: target
        };
      });
    };
    const highlight = function(anchor) {
      console.log('ANCHOR in HIGHLIGHT', anchor, anchor.range == null)
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
    const sync = function(anchors) {
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
      annotation.$orphan = hasAnchorableTargets && !hasAnchoredTargets;
      self.anchors = self.anchors.concat(anchors);
      console.log('ANCHORS', self.anchors);
      console.log(JSON.stringify(self.anchors))
      return anchors;
    };
    const deletedAchors = self.anchors.splice(0, self.anchors.length);
    deletedAchors.forEach(anchor => {
      if (anchor.annotation === annotation) {
        if ((anchor.range != null) && (annotation.target.indexOf(anchor.target) >= 0)) {
          anchors.push(anchor);
          anchoredTargets.push(anchor.target);
        } else if (anchor.highlights != null) {
          deadHighlights = deadHighlights.concat(anchor.highlights);
          delete anchor.highlights;
          delete anchor.range;
        }
      } else {
        self.anchors.push(anchor);
      }
    });
    raf(function() {
      return highlighter.removeHighlights(deadHighlights);
    });
    annotation.target.forEach(target => {
      if ((anchoredTargets.indexOf(target) < 0)) {
        const anchor = locate(target).then(highlight);
        anchors.push(anchor);
      }
    });
    return Promise.all(anchors).then(sync);
  }
}

module.exports = HighlightHelper
window.HighlightHelper = HighlightHelper