/** Returns the selected `DOMRange` in `document`. */
function selectedRange(document) {
  var selection = document.getSelection();
  if (!selection.rangeCount || selection.getRangeAt(0).collapsed) {
    return null;
  } else {
    return selection.getRangeAt(0);
  }
}

range = selectedRange(document)
this.selectedRanges = [range]


function createAnnotation(annotation) {
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
    return self.anchoring.describe(root, range, options);
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
};

function anchor(root, selector, options) {
  var fragment, i, len, maybeAssertQuote, position, promise, quote, range, ref, selector;
  if (options == null) {
    options = {};
  }
  quote = selector;
  maybeAssertQuote = function(range) {
    if (((quote != null ? quote.exact : void 0) != null) && range.toString() !== quote.exact) {
      throw new Error('quote mismatch');
    } else {
      return range;
    }
  };
  promise = Promise.reject('unable to anchor');
  if (quote != null) {
    promise = promise["catch"](function() {
      return querySelector(TextQuoteAnchor, root, quote, options);
    });
  }
  return promise;
};