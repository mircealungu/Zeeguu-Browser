/*
This returns the first sentence in the paragraph that
matches the required term. This is not perfect, but
it is probably happening very rarely, and even when
it happens, for the user, the context is still
interesting.
 */
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