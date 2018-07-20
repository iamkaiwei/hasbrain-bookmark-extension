class TextQuoteAnchor {
  constructor(root, exact, context = {}) {
    this.root = root;
    this.exact = exact;
    this.context = context;
  }

  fromRange(root, range, options) {
    selector = domAnchorTextQuote.fromRange(root, range, options);
    return new TextQuoteAnchor.fromSelector(root, selector);
  }

  fromSelector(root, range, options) {
    selector = domAnchorTextQuote.fromRange(root, range, options);
    return new TextQuoteAnchor.fromSelector(root, selector);
  }
  toSelector() {
    return {
      type: "TextQuoteSelector",
      exact: this.exact,
      prefix: this.context.prefix,
      suffix: this.context.suffix
    };
  }
  toRange(options) {
    var range;
    if (options == null) {
      options = {};
    }
    range = domAnchorTextQuote.toRange(this.root, this.toSelector(), options);
    if (range === null) {
      throw new Error("Quote not found");
    }
    return range;
  }
  toPositionAnchor(options) {
    var anchor;
    if (options == null) {
      options = {};
    }
    anchor = domAnchorTextQuote.toTextPosition(
      this.root,
      this.toSelector(),
      options
    );
    if (anchor === null) {
      throw new Error("Quote not found");
    }
    return new TextPositionAnchor(this.root, anchor.start, anchor.end);
  }
}
