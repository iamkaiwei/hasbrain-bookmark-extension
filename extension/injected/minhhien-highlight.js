function getHighlighter() {
  if (!window.minhhienHighlighter) {
    const HIGHLIGHT_NAME = 'highlight-hasbrain';
    rangy.init();
    const highlighter = rangy.createHighlighter();
    highlighter.addClassApplier(rangy.createClassApplier(HIGHLIGHT_NAME, {
      ignoreWhiteSpace: true,
      tagNames: ["span", "a"]
    }));
    window.minhhienHighlighter = highlighter
    window.HIGHLIGHT_NAME = HIGHLIGHT_NAME
  }
  return {
    highlighter: window.minhhienHighlighter,
    highlighterName: window.HIGHLIGHT_NAME
  }
}

(function(){
  const { highlighter, highlighterName } = getHighlighter();
  highlighter.highlightSelection(highlighterName)
  console.log(highlighter.serialize())
})()