/*
This returns the first sentence in the paragraph that
matches the required term. This is not perfect, but
it is probably happening very rarely, that the user
searches for a later occurrence of a word in a text
than the first one!
 */

// TODO:
/*
 - more word separators
 - more EOF
 - remove i.e, e.g., No.
 */

//BEFORE Monday 20, April
//        var sentenceRegEx = /\(?[^\.!\?]+[\.!\?]\)?/g;
//AFTER Monday 20, April
//        var sentenceRegEx = (([^.!?]*)([\s,"»«]|^)+(term)(([.!?]|$)|(([\s,"»«:]|$)([^.!?]|$)*([.!?]|$))))


function extract_context (surrounding_paragraph, term) {
    surrounding_paragraph.children("script").remove(); /* Some websites, like derbund.ch have scripts inside paragraphs!!! */
    var paragraph_text =surrounding_paragraph.text();
    var context = "";
    try {
        var replacements = {
            "%EOS%" : "[.!?]|$",   // EOS -- End Of Sentence
            "%notEOS%" : "[^.!?]",
            "%TERM%": term,
            "%BOW%": "[\\s,\"»«]|^", // BOW - Beginning of Word
            "%EOW%":  "[\\s,\"»«:]|$"
        };

        var symbolic_regex = "((%notEOS%*)(%BOW%)+(%TERM%)((%EOS%)|((%EOW%)(%notEOS%|$)*(%EOS%))))";

        var substituted_regex = symbolic_regex.replace(/%\w+%/g, function (each_match) {
            return replacements[each_match] || each_match;
        });

        var sentenceRegEx =  new RegExp(substituted_regex, "gi");


        context = $.trim(paragraph_text.match(sentenceRegEx)[0]);
    } catch (e) {
    }
    console.log(context);
    return  context;
}