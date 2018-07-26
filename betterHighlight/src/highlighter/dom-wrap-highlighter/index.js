var $ = require('jquery');

const highlightTagName = 'highlight-hasbrain';

exports.highlightRange = function(normedRange, cssClass) {
  var hl, nodes, white;
  if (cssClass == null) {
    cssClass = 'highlight-hasbrain';
  }
  white = /^\s*$/;
  hl = $(`<${highlightTagName} class="${cssClass}"></${highlightTagName}>`);
  nodes = $(normedRange.textNodes()).filter(function(i) {
    return !white.test(this.nodeValue);
  });
  return nodes.wrap(hl).parent().toArray();
};

exports.removeHighlights = function(highlights) {
  var h, j, len, results;
  results = [];
  for (j = 0, len = highlights.length; j < len; j++) {
    h = highlights[j];
    if (h.parentNode != null) {
      results.push($(h).replaceWith(h.childNodes));
    }
  }
  return results;
};

exports.getBoundingClientRect = function(collection) {
  var rects;
  rects = collection.map(function(n) {
    return n.getBoundingClientRect();
  });
  return rects.reduce(function(acc, r) {
    return {
      top: Math.min(acc.top, r.top),
      left: Math.min(acc.left, r.left),
      bottom: Math.max(acc.bottom, r.bottom),
      right: Math.max(acc.right, r.right)
    };
  });
};