var ANIMATION_SPEED = 100,
    HEIGHT = 541,
    WIDTH = 740;

var DOM_TEXT_NODE_TYPE = 3;
// http://www.w3schools.com/jsref/prop_node_nodetype.asp

var dont_close = false;

/*
 Given a selection, it prepares everything that
 can be extracted from the current page to prepare
 a contribution. All that will be missing after this
 will be the actual translation
 */
function extract_contribution_from_page(selection) {
    if (!selection.baseNode || selection.baseNode.nodeType != DOM_TEXT_NODE_TYPE) {
        return null;
    }

    var term = selection.toString().trim();

    if (term.length < 1) {
        return null;
    }
    var surroundingParagraph = $(selection.baseNode.parentNode);
    var r = new RegExp("\\w*" + term + "\\w*", "g");
    var terms = surroundingParagraph.text().match(r);

    console.log(terms.length);
    term = terms[0];
    console.log(term)

    var context = extract_context(surroundingParagraph, term);
    var title = document.getElementsByTagName("title")[0].innerHTML;

    return {
        "term": term,
        "context": context,
        "url": document.URL,
        "title": title
    };
}

function is_frameset() {
    return !$("body").length;
}

function animate_close_external_dictionary(callback) {
    if (!is_frameset()) {
        $("#zeeguu").animate({bottom: -HEIGHT}, ANIMATION_SPEED, function() {
            $(this).detach();
            if (callback) {
                callback();
            }
        });
    }
}

function close_external_dictionary(data) {
    if (external_dictionary_active) {
        dont_close = false;
        window.setTimeout(function() {
            if (!dont_close) {
                animate_close_external_dictionary();
                external_dictionary_active = false;
            }
        }, 200);
    }
}

function show_external_dictionary(data) {
    translationOverlay.style.visibility = 'hidden';
    dont_close = true;  // Abort the closing timer if it was started before this interaction
    var selection = extract_contribution_from_page(browser.getSelection());
    var url = browser.zeeguuEncodeUrl(selection.term, selection.url, selection.context, selection.title);
    if (!is_frameset()) {
        if ($("#zeeguu").size()) {
            $("#zeeguu").attr("src", url);
        } else {
            $("body").append('<iframe src="' + url + '" id="zeeguu" scrolling="no" />');
            $("#zeeguu").animate({bottom: "0px"}, ANIMATION_SPEED);
        }
    } else {
        browser.sendMessage("window", {
            url: url
        });
    }

    external_dictionary_active = true;
    browser.sendMessage("update_state", {
        selectionMode: false
    });
    window.setTimeout(function() {
        dont_close = true;  // Abort the closing timer if it was started after this interaction
    }, 200);
};





/*
 This is the code that gets injected in the external dictionary frame.
 It adds a handler for a selection, event, which will update the
 translation on the page.

 The only way for that frame to communicate with the parent frame is
 via sending EXDICT_UPDATE_TRANSLATION_FROM_SELECTION. The message is
 caught by the ext_dict_frame
  */
if (window.name == "zeeguu") {

    $(document).mouseup(function () {
        browser.withSelectedTextDo(function (selection) {
            browser.sendMessage(
                "EXDICT_UPDATE_TRANSLATION_FROM_SELECTION",
                {"new_translation": selection});
        });
    });

    disable_links();
}
