/**
* This is a modified copy of
* https://github.com/hypothesis/client/blob/v1.87.0/src/annotator/anchoring/xpath.coffee
*/

var $, findChild, getNodeName, getNodePosition, simpleXPathJQuery, simpleXPathPure;

$ = require('jquery');

simpleXPathJQuery = function(relativeRoot) {
  var jq;
  jq = this.map(function() {
    var elem, idx, path, tagName;
    path = '';
    elem = this;
    while ((elem != null ? elem.nodeType : void 0) === Node.ELEMENT_NODE && elem !== relativeRoot) {
      tagName = elem.tagName.replace(":", "\\:");
      idx = $(elem.parentNode).children(tagName).index(elem) + 1;
      idx = "[" + idx + "]";
      path = "/" + elem.tagName.toLowerCase() + idx + path;
      elem = elem.parentNode;
    }
    return path;
  });
  return jq.get();
};

simpleXPathPure = function(relativeRoot) {
  var getPathSegment, getPathTo, jq, rootNode;
  getPathSegment = function(node) {
    var name, pos;
    name = getNodeName(node);
    pos = getNodePosition(node);
    return name + "[" + pos + "]";
  };
  rootNode = relativeRoot;
  getPathTo = function(node) {
    var xpath;
    xpath = '';
    while (node !== rootNode) {
      if (node == null) {
        throw new Error("Called getPathTo on a node which was not a descendant of @rootNode. " + rootNode);
      }
      xpath = (getPathSegment(node)) + '/' + xpath;
      node = node.parentNode;
    }
    xpath = '/' + xpath;
    xpath = xpath.replace(/\/$/, '');
    return xpath;
  };
  jq = this.map(function() {
    var path;
    path = getPathTo(this);
    return path;
  });
  return jq.get();
};

findChild = function(node, type, index) {
  var child, children, found, i, len, name;
  if (!node.hasChildNodes()) {
    throw new Error("XPath error: node has no children!");
  }
  children = node.childNodes;
  found = 0;
  for (i = 0, len = children.length; i < len; i++) {
    child = children[i];
    name = getNodeName(child);
    if (name === type) {
      found += 1;
      if (found === index) {
        return child;
      }
    }
  }
  throw new Error("XPath error: wanted child not found.");
};

getNodeName = function(node) {
  var nodeName;
  nodeName = node.nodeName.toLowerCase();
  switch (nodeName) {
    case "#text":
      return "text()";
    case "#comment":
      return "comment()";
    case "#cdata-section":
      return "cdata-section()";
    default:
      return nodeName;
  }
};

getNodePosition = function(node) {
  var pos, tmp;
  pos = 0;
  tmp = node;
  while (tmp) {
    if (tmp.nodeName === node.nodeName) {
      pos++;
    }
    tmp = tmp.previousSibling;
  }
  return pos;
};

module.exports = {
  simpleXPathJQuery: simpleXPathJQuery,
  simpleXPathPure: simpleXPathPure
};
