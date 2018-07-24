const FragmentAnchor = require('dom-anchor-fragment').default;
FragmentAnchor.toString = () => 'FragmentAnchor'
const domAnchorTextPosition = require('dom-anchor-text-position');
const domAnchorTextQuote = require('dom-anchor-text-quote');

const xpathRange = require('./range');

const missingParameter = function(name) {
  throw new Error('missing required parameter "' + name + '"');
};


/**
* class:: RangeAnchor(range)
*
* This anchor type represents a DOM Range.
*
* :param Range range: A range describing the anchor.
*/

class RangeAnchor {
  constructor(root, range) {
    if (root == null) {
      missingParameter('root');
    }
    if (range == null) {
      missingParameter('range');
    }
    this.root = root;
    this.range = xpathRange.sniff(range).normalize(this.root);
  }

  static toString() {
    return 'RangeAnchor'
  }

  static fromRange(root, range) {
    return new RangeAnchor(root, range);
  };

  static fromSelector(root, selector) {
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

  toRange() {
    return this.range.toRange();
  };

  toSelector(options) {
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
}


/**
 * Converts between TextPositionSelector selectors and Range objects.
 */
class TextPositionAnchor {
  constructor(root, start, end) {
    this.root = root;
    this.start = start;
    this.end = end;
  }
  static fromRange(root, range) {
    const selector = domAnchorTextPosition.fromRange(root, range);
    return TextPositionAnchor.fromSelector(root, selector);
  };
  static fromSelector(root, selector) {
    return new TextPositionAnchor(root, selector.start, selector.end);
  };
  static toString() {
    return 'TextPositionAnchor'
  }
  toSelector() {
    return {
      type: 'TextPositionSelector',
      start: this.start,
      end: this.end
    };
  };
  toRange() {
    return domAnchorTextPosition.toRange(this.root, {
      start: this.start,
      end: this.end
    });
  };
}

/**
 * Converts between TextQuoteSelector selectors and Range objects.
 */
class TextQuoteAnchor {
  constructor(root, exact, context) {
    if (context == null) {
      context = {};
    }
    this.root = root;
    this.exact = exact;
    this.context = context;
  }
  static fromRange(root, range, options) {
    const selector = domAnchorTextQuote.fromRange(root, range, options);
    return TextQuoteAnchor.fromSelector(root, selector);
  };
  static toString() {
    return 'TextQuoteAnchor'
  }
  static fromSelector(root, selector) {
    var prefix, suffix;
    prefix = selector.prefix, suffix = selector.suffix;
    return new TextQuoteAnchor(root, selector.exact, {
      prefix: prefix,
      suffix: suffix
    });
  }

  toSelector() {
    return {
      type: 'TextQuoteSelector',
      exact: this.exact,
      prefix: this.context.prefix,
      suffix: this.context.suffix
    };
  };
  toRange(options) {
    var range;
    if (options == null) {
      options = {};
    }
    console.log('ROOT in TextQuoteAnchor', this.root, this.toSelector())
    range = domAnchorTextQuote.toRange(this.root, this.toSelector(), options);
    if (range === null) {
      throw new Error('Quote not found');
    }
    return range;
  };
  toPositionAnchor(options) {
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

}

module.exports = {
  RangeAnchor, 
  FragmentAnchor,
  TextPositionAnchor,
  TextQuoteAnchor
}