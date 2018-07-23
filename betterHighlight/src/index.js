highlighter = require('./highlighter')
rangeUtil = require('./range-util')
xpathRange = require('./anchoring/range')
rangeUtil = require('./range-util')
anchoring = require('./anchoring/html');
class HighlightHelper {
  
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
    var getSelectors, info, metadata, ranges, ref, ref1, root, selectors, self, setDocumentInfo, setTargets, targets;
    if (annotation == null) {
      annotation = {};
    }
    self = this;
    root = this.element[0];
    ranges = (ref = this.selectedRanges) != null ? ref : [];
    this.selectedRanges = null;
    getSelectors = function(range) {
      var options;
      options = {
        cache: self.anchoringCache,
        ignoreSelector: '[class^="annotator-"]'
      };
      return self.getAnchoring.describe(root, range, options);
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
    selectors = Promise.all(ranges.map(getSelectors));
    metadata = info.then(setDocumentInfo);
    targets = Promise.all([info, selectors]).then(setTargets);
    targets.then(function() {
      return self.publish('beforeAnnotationCreated', [annotation]);
    });
    targets.then(function() {
      return self.anchor(annotation);
    });
    if (!annotation.$highlight) {
      if ((ref1 = this.crossframe) != null) {
        ref1.call('showSidebar');
      }
    }
    return annotation;
  }
  anchor(annotation) {
    var anchor, anchoredTargets, anchors, deadHighlights, highlight, i, j, len, len1, locate, ref, ref1, ref2, root, self, sync, target;
    self = this;
    root = this.element[0];
    anchors = [];
    anchoredTargets = [];
    deadHighlights = [];
    if (annotation.target == null) {
      annotation.target = [];
    }
    locate = function(target) {
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
      return self.getAnchoring.anchor(root, target.selector, options).then(function(range) {
        return {
          annotation: annotation,
          target: target,
          range: range
        };
      })["catch"](function() {
        return {
          annotation: annotation,
          target: target
        };
      });
    };
    highlight = function(anchor) {
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
    sync = function(anchors) {
      var anchor, hasAnchorableTargets, hasAnchoredTargets, i, len, ref, ref1;
      hasAnchorableTargets = false;
      hasAnchoredTargets = false;
      for (i = 0, len = anchors.length; i < len; i++) {
        anchor = anchors[i];
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
      if ((ref = self.plugins.BucketBar) != null) {
        ref.update();
      }
      if ((ref1 = self.plugins.CrossFrame) != null) {
        ref1.sync([annotation]);
      }
      return anchors;
    };
    ref = self.anchors.splice(0, self.anchors.length);
    for (i = 0, len = ref.length; i < len; i++) {
      anchor = ref[i];
      if (anchor.annotation === annotation) {
        if ((anchor.range != null) && (ref1 = anchor.target, indexOf.call(annotation.target, ref1) >= 0)) {
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
    }
    raf(function() {
      return highlighter.removeHighlights(deadHighlights);
    });
    ref2 = annotation.target;
    for (j = 0, len1 = ref2.length; j < len1; j++) {
      target = ref2[j];
      if (!(indexOf.call(anchoredTargets, target) < 0)) {
        continue;
      }
      anchor = locate(target).then(highlight);
      anchors.push(anchor);
    }
    return Promise.all(anchors).then(sync);
  }
}

module.exports = HighlightHelper
window.HighlightHelper = HighlightHelper