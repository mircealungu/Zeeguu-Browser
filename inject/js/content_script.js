var external_dictionary_active = false,
    selection_mode = false;

/*
This sets an event listener for a message
of the type PAGE_NEEDS_WORD_TRANSLATION. This will be sent
sometimes from the page, and must trigger the
plugin to show up with the translation.

This event listener is run in the context of the
Content Script.

 */
var port = chrome.runtime.connect();
window.addEventListener("message", function(event) {
    // We only accept messages from ourselves
    if (event.source != window)
        return;

    if (event.data.type) {
        if (event.data.type == "PAGE_NEEDS_WORD_TRANSLATION") {
            message = {
                url: event.data.url,
                context: event.data.context,
                term: event.data.term
            };
            browser.sendMessage("ZM_SHOW_TRANSLATION", message);
        }
        if (event.data.type == "PAGE_NEEDS_WORD_TO_BE_UPLOADED") {
            contribute_with_context(
                    event.data.term,
                    event.data.url,
                    event.data.context,
                    event.data.translation,
                    event.data.title);
            highlight_words([event.data.term]);
        }
    }

}, false);


loadState(function() {

    $(document).click(function () {
        /* closing the external dict if the user clicks anywhere in page */
        if (external_dictionary_active) browser.sendMessage("ZM_CLOSE_EXT_DICT");
    });

    if (state.selectionMode) disable_links();

    if (state.highlight) getUserWords(function (user_words) {
            highlight_words(user_words)
        });

    addStateChangeListener("selectionMode", function (selectionMode) {
        update_link_state(selectionMode);
    });

    addStateChangeListener("highlight", function (highlight) {
        change_highlight_of_page(highlight);
    });

    /************************************
     This is the  context of the original page.
     *************************************/

    if (window.top == window.self) {



        // Mouse up is when we test whether
        // the user might have finished selecting a word in page
        document.addEventListener('mouseup', function (e) {
            /*
             Before adding the delay:
             - the translation would start popping up too
             early while the user was in the process of double-clicking
             - a selected word would be clicked, and it would still
             be somehow selected on mouseUp. this would
             */
            setTimeout(function () {
                mouse_up_in_page(e, external_dictionary_active);
            }, 50)
        }, false);

        browser.addMessageListener("ZM_SHOW_TRANSLATION", show_external_dictionary);
        browser.addMessageListener("ZM_CLOSE_EXT_DICT", close_external_dictionary);
    }

    /*
    Font awesome is needed for the icons in the translation overlay
     */
    injectFontAwesomeToHeadOf(document);
});




