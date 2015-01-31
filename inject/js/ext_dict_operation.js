var ANIMATION_SPEED = 100,
    HEIGHT = 541,
    WIDTH = 740;

var closingTimer;
var dont_close = false;

/*
 This is required to populate the external dictionary window
 */
function term_context_url_triple(selection) {
    if (!selection.baseNode || selection.baseNode.nodeType != 3) {
        return null;
    }

    var term = selection.toString();
    if (term.length < 1) {
        return null;
    }
    var surroundingParagraph = $(selection.baseNode.parentNode).text();
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
    browser.sendMessage("unhighlight");
    if (!is_frameset()) {
        $("#zeeguu").animate({bottom: -HEIGHT}, ANIMATION_SPEED, function() {
            $(this).detach();
            if (callback) {
                callback();
            }
        });
    } else {
        close_zeeguu_window();
    }
}

function close_external_dictionary(data) {
    if (external_dictionary_active && !closingTimer) {
        dont_close = false;
        window.setTimeout(function() {
            if (!dont_close) {
                closingTimer = null;
                animate_close_external_dictionary();
                external_dictionary_active = false;
            }
        }, 200);
    }
}

function show_external_dictionary(data) {
    translationOverlay.style.visibility = 'hidden';
    dont_close = true;  // Abort the closing timer if it was started before this interaction
    var selection = term_context_url_triple(browser.getSelection());
    var url = browser.zeeguuUrl(selection.term, selection.url, selection.context);
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
    browser.sendMessage("unhighlight");
    browser.sendMessage("update_state", {
        selectionMode: false
    });
    window.setTimeout(function() {
        dont_close = true;  // Abort the closing timer if it was started after this interaction
    }, 200);
};





/*
 This is the code that gets injected in the external dictionary frame.
 The only way for that frame to communicate with the parent frame is
 via sending EXDICT_UPDATE_TRANSLATION_FROM_SELECTION. The message is
 caught by the ext_dict_frame
  */
if (window.name == "zeeguu") {
    $(document).mouseup(function () {
        var selection = browser.getSelection();
        var message = term_context_url_triple(selection);
        if (message === null) return;
        browser.sendMessage("EXDICT_UPDATE_TRANSLATION_FROM_SELECTION", message);
    });

    disable_links();
}
