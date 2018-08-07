const highlighter = require('./highlighter')
const rangeUtil = require('./range-util')
const xpathRange = require('./anchoring/range')
const anchoring = require('./anchoring/html');
const anchoringPdf = require('./anchoring/pdf');
const domAnchorTextQuote = require('dom-anchor-text-quote');

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
    ignoreSelector: '[class^="anchoringPdf-"]'
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
  constructor(root) {
    this.root = root || document.body;
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
    if (!selection.rangeCount) return false;
    const range = selection.getRangeAt(0);
    const _iterator = document.createNodeIterator(
      range.commonAncestorContainer,
      NodeFilter.SHOW_ALL, // pre-filter
      {
          // custom filter
          acceptNode: function (node) {
              return NodeFilter.FILTER_ACCEPT;
          }
      }
    );
    const _nodes = [];
    while (_iterator.nextNode()) {
        if (_nodes.length === 0 && _iterator.referenceNode !== range.startContainer) continue;
        _nodes.push(_iterator.referenceNode);
        if (_iterator.referenceNode === range.endContainer) break;
    }
    const highlightTagName = 'highlight-hasbrain';
    const containsHighlightTags = _nodes.some(ele => ele.tagName && (ele.tagName.toLowerCase() === highlightTagName.toLowerCase()));
    return !!focusRect && !containsHighlightTags;
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
    const root = this.root // document.body
    console.log('TARGET IN RESTORE', targets)
    return Promise.all(targets.map(target => locate(root)(target).then(highlight(root)))).then(this.sync.bind(this))
  }
  createAnnotation(annotation = {}) {
    const root = this.root // document.body
    const ranges = this.selectedRanges || [];
    this.selectedRanges = null;
    const getSelectors = (root) => function(range) {
      var options;
      options = {
        ignoreSelector: '[class^="anchoringPdf-"]'
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
    const root = this.root // document.body
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
  removeHighlights(highlights) {
    console.log('REMOVE HIHGLIGHTS', highlights)
    return highlighter.removeHighlights(highlights);
  }
}

const RenderingStates = {
  INITIAL: 0,
  RUNNING: 1,
  PAUSED: 2,
  FINISHED: 3,
}
class PdfHighlighterHelper {
  constructor(highlightHoverHandlerGenerator) {
    this.documentLoaded = null
    this.anchors = []
    this.pdfViewer = PDFViewerApplication.pdfViewer;
    this.pdfViewer.viewer.classList.add('has-transparent-text-layer');
    this.root = document.getElementById("viewer");
    this.highlightHoverHandlerGenerator = highlightHoverHandlerGenerator

    this.observer = new MutationObserver(mutations => this._update());
    return this.observer.observe(this.pdfViewer.viewer, {
      attributes: true,
      attributeFilter: ['data-loaded'],
      childList: true,
      subtree: true
    });
  }
  getMetadata() {
    const title = document.title;
    const link = decodeURIComponent(window.location.href);
    return {
      title,
      link,
    };
  }
  destroy() {
    this.pdfViewer.viewer.classList.remove('has-transparent-text-layer');
    return this.observer.disconnect();
  }

  findText(container, text) {
    return domAnchorTextQuote.toRange(container, { exact: text });
  }

  getSelectorFromSelection() {
    const selection = window.getSelection();
    const container = this.root;;
    console.log('PDF EXACT TEXT SELCTION', selection.toString())
    const range = this.findText(container, selection.toString());
    return anchoringPdf.describe(container, range);
  }

  createHighlight(_selection) {
    const container = this.root;;
    return this.getSelectorFromSelection(container).then(selectors => {
      return anchoringPdf.anchor(container, selectors)
      .then(range => {
          return {
            // annotation: annotation,
            target: {
              selector: selectors
            },
            range: range
          };
      })
      .then(highlight(container))
      .then(anchor => [anchor])
      .then(this.sync.bind(this))
    })
  }

  getAnchors() {
    return this.anchors;
  };

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
    this.anchors = this.anchors.concat(anchors).filter(anchor => anchor.highlights);
    return anchors;
  };

  restoreHighlightFromTargets(targets) {
    const container = this.root;
    
    return Promise.all(targets.map(target => {
      const selectors = target.selector
      anchoringPdf.anchor(container, selectors)
      .then(range => {
          return {
            // annotation: annotation,
            target: {
              selector: selectors
            },
            range: range
          };
      })
      .then(highlight(container))
      .then(anchor => [anchor])
      .then(this.sync.bind(this))
    }));
  }

  _update() {
    const { anchors, pdfViewer } = this;
    // A list of annotations that need to be refreshed.
    const refreshAnnotations = [];

    const container = this.root;
    
    // Check all the pages with text layers that have finished rendering.
    for (let pageIndex = 0, end = pdfViewer.pagesCount, asc = 0 <= end; asc ? pageIndex < end : pageIndex > end; asc ? pageIndex++ : pageIndex--) {
      const page = pdfViewer.getPageView(pageIndex);
      if (!(page.textLayer != null ? page.textLayer.renderingDone : undefined)) { continue; }

      const div = page.div != null ? page.div : page.el;
      const placeholder = div.getElementsByClassName('annotator-placeholder')[0];
      // Detect what needs to be done by checking the rendering state.
      switch (page.renderingState) {
        case RenderingStates.INITIAL:
          // This page has been reset to its initial state so its text layer
          // is no longer valid. Null it out so that we don't process it again.
          page.textLayer = null;
          break;
        case RenderingStates.FINISHED:
          // This page is still rendered. If it has a placeholder node that
          // means the PDF anchoring module anchored annotations before it was
          // rendered. Remove this, which will cause the annotations to anchor
          // again, below.
          if (placeholder != null) {
            placeholder.parentNode.removeChild(placeholder);
          }
          break;
      }
    }

    // Find all the anchors that have been invalidated by page state changes.
    for (let anchor of anchors) {
      // Skip any we already know about.
      if (anchor.highlights != null) {
        if (refreshAnnotations.includes(anchor)) {
          continue;
        }

        // If the highlights are no longer in the document it means that either
        // the page was destroyed by PDF.js or the placeholder was removed above.
        // The annotations for these anchors need to be refreshed.
        for (let hl of anchor.highlights) {
          if (!document.body.contains(hl)) {
            delete anchor.highlights;
            delete anchor.range;
            refreshAnnotations.push(anchor);
            break;
          }
        }
      }
    }

    const result = [];
    for (let annotation of refreshAnnotations) {
      const selectors = annotation.target.selector;
      result.push(
      anchoringPdf.anchor(container, selectors)
      .then(range => {
          return {
            // annotation: annotation,
            target: {
              selector: selectors
            },
            range: range
          };
      })
      .then(highlight(container))
      .then(anchor => [anchor])
      .then(this.sync.bind(this)));
    }
    
    return Promise.all(result)
    .then(results => {
      console.log('I AM UPDATED', result);
      if (this.highlightHoverHandlerGenerator && typeof this.highlightHoverHandlerGenerator === 'function') {
        const anchors = this.anchors;
        anchors.forEach(anchor => {
          console.log('anchor', anchor);
        })
      } 
      return results;
    });
  }
}

module.exports = { HighlightHelper, PdfHighlighterHelper }

window.HighlightHelper = HighlightHelper
window.PdfHighlighterHelper =  PdfHighlighterHelper