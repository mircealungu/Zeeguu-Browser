var highlight_when_unhighlighting = false,
    external_dictionary_active = false,
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
        if (external_dictionary_active) browser.sendMessage("close");
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


    browser.addMessageListener("unhighlight", function (data) {
        unhighlight();
    });

    /************************************
     This is the  context of the original page.
     *************************************/

    if (window.top == window.self) {

        /*
         Before adding the delay:
         - the translation would start popping up too
         early while the user was in the process of double-clicking
         - a selected word would be clicked, and it would still
         be somehow selected on mouseUp. this would
         */
        function delayed_mouse_up(e) {
            setTimeout(function () {
                mouse_up_in_page(e, external_dictionary_active);
            }, 50);
        }

        // Mouse up is when the user might have finished selecting a word in page
        document.addEventListener('mouseup', delayed_mouse_up, false);

        browser.addMessageListener("ZM_SHOW_TRANSLATION", show_external_dictionary);
        browser.addMessageListener("close", close_external_dictionary);

        browser.addMessageListener("browser_action", function (data) {
            toggleSelectionModeBox(!selection_mode);
            browser.sendMessage("selection_mode", {
                enabled: !selection_mode
            });
        });
    }
});

function highlight() {
    highlight_when_unhighlighting = false;
    var span = document.createElement("span");
    span.className = "zeeguu-highlight";

    try {
        browser.getSelection().getRangeAt(0).surroundContents(span);
    } catch (e) {

    }
}

function unhighlight() {
//    $(".zeeguu-highlight").addClass("zeeguu-remove");
    $(".zeeguu-highlight").addClass("zeeguu-visited");
    if (highlight_when_unhighlighting) {
        highlight();
    }
//    $(".zeeguu-remove").each(function() {
//        var parent = this.parentNode,
//            lastChild = this.lastChild,
//            nextlastChild;
//        parent.replaceChild(lastChild, this);
//        while(this.lastChild) {
//            nextlastChild = this.lastChild;
//            parent.insertBefore(nextlastChild, lastChild);
//            lastChild = nextlastChild;
//        }
//        parent.normalize();
//    });
}

injectFontAwesomeToHeadOf(document);

