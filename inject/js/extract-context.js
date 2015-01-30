function extract_context (surrounding_paragraph, term) {
    var context = "";
    try {
        var sentenceRegEx = /\(?[^\.!\?]+[\.!\?]\)?/g;
        context = $.trim(surrounding_paragraph.match(sentenceRegEx).filter(
            function (eachSentence) {
            return eachSentence.indexOf(term) >= 0;
        })[0])
    } catch (e) {
    }
    return context;
}