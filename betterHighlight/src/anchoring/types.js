var RangeAnchor, TextPositionAnchor, TextQuoteAnchor, domAnchorTextPosition, domAnchorTextQuote, missingParameter, xpathRange;

domAnchorTextPosition = require('dom-anchor-text-position');

domAnchorTextQuote = require('dom-anchor-text-quote');

xpathRange = require('./range');

missingParameter = function(name) {
  throw new Error('missing required parameter "' + name + '"');
};


/**
 * class:: RangeAnchor(range)
#
 * This anchor type represents a DOM Range.
#
 * :param Range range: A range describing the anchor.
 */

RangeAnchor = (function() {
  function RangeAnchor(root, range) {
    if (root == null) {
      missingParameter('root');
    }
    if (range == null) {
      missingParameter('range');
    }
    this.root = root;
    this.range = xpathRange.sniff(range).normalize(this.root);
  }

  RangeAnchor.fromRange = function(root, range) {
    return new RangeAnchor(root, range);
  };

  RangeAnchor.fromSelector = function(root, selector) {
    var data, range;
    data = {
      start: selector.startContainer,
      startOffset: selector.startOffset,
      end: selector.endContainer,
      endOffset: selector.endOffset
    };
    range = new xpathRange.SerializedRange(data);
    return new RangeAnchor(root, range);
  };

  RangeAnchor.prototype.toRange = function() {
    return this.range.toRange();
  };

  RangeAnchor.prototype.toSelector = function(options) {
    var range;
    if (options == null) {
      options = {};
    }
    range = this.range.serialize(this.root, options.ignoreSelector);
    return {
      type: 'RangeSelector',
      startContainer: range.start,
      startOffset: range.startOffset,
      endContainer: range.end,
      endOffset: range.endOffset
    };
  };

  return RangeAnchor;

})();


/**
 * Converts between TextPositionSelector selectors and Range objects.
 */

TextPositionAnchor = (function() {
  function TextPositionAnchor(root, start, end) {
    this.root = root;
    this.start = start;
    this.end = end;
  }

  TextPositionAnchor.fromRange = function(root, range) {
    var selector;
    selector = domAnchorTextPosition.fromRange(root, range);
    return TextPositionAnchor.fromSelector(root, selector);
  };

  TextPositionAnchor.fromSelector = function(root, selector) {
    return new TextPositionAnchor(root, selector.start, selector.end);
  };

  TextPositionAnchor.prototype.toSelector = function() {
    return {
      type: 'TextPositionSelector',
      start: this.start,
      end: this.end
    };
  };

  TextPositionAnchor.prototype.toRange = function() {
    return domAnchorTextPosition.toRange(this.root, {
      start: this.start,
      end: this.end
    });
  };

  return TextPositionAnchor;

})();


/**
 * Converts between TextQuoteSelector selectors and Range objects.
 */

TextQuoteAnchor = (function() {
  function TextQuoteAnchor(root, exact, context) {
    if (context == null) {
      context = {};
    }
    this.root = root;
    this.exact = exact;
    this.context = context;
  }

  TextQuoteAnchor.fromRange = function(root, range, options) {
    var selector;
    selector = domAnchorTextQuote.fromRange(root, range, options);
    return TextQuoteAnchor.fromSelector(root, selector);
  };

  TextQuoteAnchor.fromSelector = function(root, selector) {
    var prefix, suffix;
    prefix = selector.prefix, suffix = selector.suffix;
    return new TextQuoteAnchor(root, selector.exact, {
      prefix: prefix,
      suffix: suffix
    });
  };

  TextQuoteAnchor.prototype.toSelector = function() {
    return {
      type: 'TextQuoteSelector',
      exact: this.exact,
      prefix: this.context.prefix,
      suffix: this.context.suffix
    };
  };

  TextQuoteAnchor.prototype.toRange = function(options) {
    var range;
    if (options == null) {
      options = {};
    }
    range = domAnchorTextQuote.toRange(this.root, this.toSelector(), options);
    if (range === null) {
      throw new Error('Quote not found');
    }
    return range;
  };

  TextQuoteAnchor.prototype.toPositionAnchor = function(options) {
    var anchor;
    if (options == null) {
      options = {};
    }
    anchor = domAnchorTextQuote.toTextPosition(this.root, this.toSelector(), options);
    if (anchor === null) {
      throw new Error('Quote not found');
    }
    return new TextPositionAnchor(this.root, anchor.start, anchor.end);
  };

  return TextQuoteAnchor;

})();

exports.RangeAnchor = RangeAnchor;

exports.FragmentAnchor = require('dom-anchor-fragment');

exports.TextPositionAnchor = TextPositionAnchor;

exports.TextQuoteAnchor = TextQuoteAnchor;

// ---
// generated by coffee-script 1.9.2