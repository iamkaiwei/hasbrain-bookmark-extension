function onContextMenuClick() {
  window.readyForHighlight = false;
  const highlightHelper = getHighlighter();
  const selection = document.getSelection()
  if (!highlightHelper.canCreateHighlightFromSelection(selection)) {
    return
  }
  highlightHelper.saveRangeBeforeCreateHighlight(selection);
  highlightHelper.createHighlight().then(result => {    if (result.length) {
      window.getSelection().empty()
      const anchor = result[0];
      if (anchor && anchor.target && anchor.target.selector) {
        const textQuoteSelector = anchor.target.selector.find(({ type }) => type === "TextQuoteSelector");
        if (textQuoteSelector) {
          return postHighlight(targetToHighlightData(anchor.target))
          .then(responseData => {
            window.readyForHighlight = true;
            const highlightData = responseData.record.highlights
            const currentHighlight = highlightData.find(({ prev, core, next }) => prev === textQuoteSelector.prefix && core === textQuoteSelector.exact && next === textQuoteSelector.suffix);
            renderHighlightCircleFromAnchor({
              ...anchor,
              target: {
                ...anchor.target,
                ...currentHighlight,
              },
            })
            if (window.shouldPopup) {
              renderBookmarkPopup();
              window.shouldPopup = false
            }
          });
        }
      }
    }
  });
}

onContextMenuClick()