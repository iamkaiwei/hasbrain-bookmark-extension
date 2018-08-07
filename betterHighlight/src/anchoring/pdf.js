/**
 * This is a modified copy of
 * https://github.com/hypothesis/client/blob/v1.87.0/src/annotator/anchoring/pdf.coffee
 */

const seek = require('dom-seek');

const xpathRange = require('./range');

const html = require('./html');

const RenderingStates = {
  INITIAL: 0,
  RUNNING: 1,
  PAUSED: 2,
  FINISHED: 3,
};

const { TextPositionAnchor, TextQuoteAnchor } = require('./types')

pageTextCache = {};

quotePositionCache = {};

const getSiblingIndex = function(node) {
  var siblings;
  siblings = Array.prototype.slice.call(node.parentNode.childNodes);
  return siblings.indexOf(node);
};

const getNodeTextLayer = function(node) {
  var ref1;
  while (!((ref1 = node.classList) != null ? ref1.contains('page') : void 0)) {
    node = node.parentNode;
  }
  return node.getElementsByClassName('textLayer')[0];
};

const getPage = function(pageIndex) {
  return PDFViewerApplication.pdfViewer.getPageView(pageIndex);
};

const getPageTextContent = function(pageIndex) {
  var joinItems;
  if (pageTextCache[pageIndex] != null) {
    return pageTextCache[pageIndex];
  } else {
    joinItems = function(arg) {
      var item, items, nonEmpty, textContent;
      items = arg.items;
      nonEmpty = (function() {
        var i, len, results;
        results = [];
        for (i = 0, len = items.length; i < len; i++) {
          item = items[i];
          if (/\S/.test(item.str)) {
            results.push(item.str);
          }
        }
        return results;
      })();
      textContent = nonEmpty.join('');
      return textContent;
    };
    pageTextCache[pageIndex] = PDFViewerApplication.pdfViewer.getPageTextContent(pageIndex).then(joinItems);
    return pageTextCache[pageIndex];
  }
};

const getPageOffset = function(pageIndex) {
  var index, next;
  index = -1;
  next = function(offset) {
    if (++index === pageIndex) {
      return Promise.resolve(offset);
    }
    return getPageTextContent(index).then(function(textContent) {
      return next(offset + textContent.length);
    });
  };
  return next(0);
};

const findPage = function(offset) {
  var count, index, total;
  index = 0;
  total = 0;
  count = function(textContent) {
    var lastPageIndex;
    lastPageIndex = PDFViewerApplication.pdfViewer.pagesCount - 1;
    if (total + textContent.length > offset || index === lastPageIndex) {
      offset = total;
      return Promise.resolve({
        index: index,
        offset: offset,
        textContent: textContent
      });
    } else {
      index++;
      total += textContent.length;
      return getPageTextContent(index).then(count);
    }
  };
  return getPageTextContent(0).then(count);
};

const anchorByPosition = function(page, anchor, options) {
  var div, placeholder, range, ref1, ref2, renderingDone, renderingState, root, selector;
  renderingState = page.renderingState;
  renderingDone = page.textLayer != null ? page.textLayer.renderingDone : undefined;
  if (renderingState === RenderingStates.FINISHED && renderingDone) {
    root = page.textLayer.textLayerDiv;
    selector = anchor.toSelector(options);
    return html.anchor(root, [selector]);
  } else {
    div = (ref2 = page.div) != null ? ref2 : page.el;
    placeholder = div.getElementsByClassName('annotator-placeholder')[0];
    if (placeholder == null) {
      placeholder = document.createElement('span');
      placeholder.classList.add('annotator-placeholder');
      placeholder.textContent = 'Loading annotations…';
      div.appendChild(placeholder);
    }
    range = document.createRange();
    range.setStartBefore(placeholder);
    range.setEndAfter(placeholder);
    return range;
  }
};

const findInPages = function(...args) {
  const [pageIndex, ...rest] = Array.from(args[0]), quote = args[1], position = args[2];
  if (pageIndex == null) {
    return Promise.reject(new Error('Quote not found'));
  }

  const attempt = function(info) {
    // Try to find the quote in the current page.
    const [page, content, offset] = Array.from(info);
    const root = {textContent: content};
    const anchor = TextQuoteAnchor.fromSelector(root, quote);
    if (position != null) {
      let hint = position.start - offset;
      hint = Math.max(0, hint);
      hint = Math.min(hint, content.length);
      return anchor.toPositionAnchor({hint});
    } else {
      return anchor.toPositionAnchor();
    }
  };

  const next = () => findInPages(rest, quote, position);

  const cacheAndFinish = function(anchor) {
    if (position) {
      if (quotePositionCache[quote.exact] == null) { quotePositionCache[quote.exact] = {}; }
      quotePositionCache[quote.exact][position.start] = {page, anchor};
    }
    return anchorByPosition(page, anchor);
  };

  var page = getPage(pageIndex);
  const content = getPageTextContent(pageIndex);
  const offset = getPageOffset(pageIndex);

  return Promise.all([page, content, offset])
  .then(attempt)
  .then(cacheAndFinish)
  .catch(next);
};

const prioritizePages = function(position) {
  var i, pageIndices, pagesCount, results;
  pagesCount = PDFViewerApplication.pdfViewer.pagesCount;
  pageIndices = (function() {
    results = [];
    for (var i = 0; 0 <= pagesCount ? i < pagesCount : i > pagesCount; 0 <= pagesCount ? i++ : i--){ results.push(i); }
    return results;
  }).apply(this);
  const sort = function(pageIndex) {
    var left, result, right;
    left = pageIndices.slice(0, pageIndex);
    right = pageIndices.slice(pageIndex);
    result = [];
    while (left.length || right.length) {
      if (right.length) {
        result.push(right.shift());
      }
      if (left.length) {
        result.push(left.pop());
      }
    }
    return result;
  };
  if (position != null) {
    return findPage(position.start).then(function(arg) {
      var index;
      index = arg.index;
      return sort(index);
    });
  } else {
    return Promise.resolve(pageIndices);
  }
};


/**
 * Anchor a set of selectors.
#
 * This function converts a set of selectors into a document range.
 * It encapsulates the core anchoring algorithm, using the selectors alone or
 * in combination to establish the best anchor within the document.
#
 * :param Element root: The root element of the anchoring context.
 * :param Array selectors: The selectors to try.
 * :param Object options: Options to pass to the anchor implementations.
 * :return: A Promise that resolves to a Range on success.
 * :rtype: Promise
 */

exports.anchor = function(root, selectors, options) {
  var assertQuote, i, len, position, promise, quote, ref1, selector;
  if (options == null) {
    options = {};
  }
  position = null;
  quote = null;
  ref1 = selectors != null ? selectors : [];
  for (i = 0, len = ref1.length; i < len; i++) {
    selector = ref1[i];
    switch (selector.type) {
      case 'TextPositionSelector':
        position = selector;
        break;
      case 'TextQuoteSelector':
        quote = selector;
    }
  }
  promise = Promise.reject('unable to anchor');
  assertQuote = function(range) {
    if (((quote != null ? quote.exact : void 0) != null) && range.toString() !== quote.exact) {
      throw new Error('quote mismatch');
    } else {
      return range;
    }
  };
  if (position != null) {
    promise = promise["catch"](function() {
      return findPage(position.start).then(function(arg) {
        var anchor, end, index, length, offset, page, start, textContent;
        index = arg.index, offset = arg.offset, textContent = arg.textContent;
        page = getPage(index);
        start = position.start - offset;
        end = position.end - offset;
        length = end - start;
        assertQuote(textContent.substr(start, length));
        anchor = new TextPositionAnchor(root, start, end);
        return anchorByPosition(page, anchor, options);
      });
    });
  }
  if (quote != null) {
    promise = promise["catch"](function() {
      var anchor, page, ref2, ref3;
      if ((position != null) && (((ref2 = quotePositionCache[quote.exact]) != null ? ref2[position.start] : void 0) != null)) {
        ref3 = quotePositionCache[quote.exact][position.start], page = ref3.page, anchor = ref3.anchor;
        return anchorByPosition(page, anchor, options);
      }
      return prioritizePages(position).then(function(pageIndices) {
        return findInPages(pageIndices, quote, position);
      });
    });
  }
  return promise;
};


/**
 * Convert a DOM Range object into a set of selectors.
#
 * Converts a DOM `Range` object describing a start and end point within a
 * `root` `Element` and converts it to a `[position, quote]` tuple of selectors
 * which can be saved into an annotation and later passed to `anchor` to map
 * the selectors back to a `Range`.
#
 * :param Element root: The root Element
 * :param Range range: DOM Range object
 * :param Object options: Options passed to `TextQuoteAnchor` and
 *                        `TextPositionAnchor`'s `toSelector` methods.
 */

exports.describe = function(root, range, options) {
  var end, endPageIndex, endRange, endTextLayer, iter, start, startPageIndex, startRange, startTextLayer;
  if (options == null) {
    options = {};
  }
  range = new xpathRange.BrowserRange(range).normalize();
  startTextLayer = getNodeTextLayer(range.start);
  endTextLayer = getNodeTextLayer(range.end);
  if (startTextLayer !== endTextLayer) {
    throw new Error('selecting across page breaks is not supported');
  }
  startRange = range.limit(startTextLayer);
  endRange = range.limit(endTextLayer);
  startPageIndex = getSiblingIndex(startTextLayer.parentNode);
  endPageIndex = getSiblingIndex(endTextLayer.parentNode);
  iter = document.createNodeIterator(startTextLayer, NodeFilter.SHOW_TEXT);
  start = seek(iter, range.start);
  end = seek(iter, range.end) + start + range.end.textContent.length;
  return getPageOffset(startPageIndex).then(function(pageOffset) {
    var position, quote, r;
    start += pageOffset;
    end += pageOffset;
    position = new TextPositionAnchor(root, start, end).toSelector(options);
    r = document.createRange();
    r.setStartBefore(startRange.start);
    r.setEndAfter(endRange.end);
    quote = TextQuoteAnchor.fromRange(root, r, options).toSelector(options);
    return Promise.all([position, quote]);
  });
};


/**
 * Clear the internal caches of page text contents and quote locations.
#
 * This exists mainly as a helper for use in tests.
 */

exports.purgeCache = function() {
  pageTextCache = {};
  return quotePositionCache = {};
};