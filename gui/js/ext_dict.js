/* This file doesn't follow the naming scheme to avoid confusion with /lib/zeeguu.js */

var term;
var context;
var url;
var contributed = false;

function reloadDictionaries() {
    $("#dictionaries").html("| ");

    id = 0;
    allDictsForLanguage(state.from).forEach(function(dict) {
        id = id + 1;
        if (state.dictUrl == dict.url) {
            $("#dictionaries").append('<a class="selected_dict" id="dict'+id +'" href="#">' + dict.name + '</b></span> | ')
        } else {
            $("#dictionaries").append('<a class="nonselected_dict" id="dict'+id +'" href="#">' + dict.name + '</a> | ');
            $("#dict"+id).click(function () {

                browser.sendMessage("update_state", {
                    dictUrl: dict.url
                });
                setTimeout(function() {redisplaySearchResults()}, 300);
            })
        }
    });
}
function redisplaySearchResults() {
    log_search($("#contribute-from").val())
    $("#dictframe").attr("src",translationURL($("#contribute-from").val()));
    reloadDictionaries();
}

loadState(function() {
    if (!is_logged_in()) {
        window.location = "login.html" + window.location.search;
    } else {
        var message = browser.zeeguuDecodeURL(window.location.search);
        if (message == null) {
            window.location = "error.html";
            return;
        }
        $("#zeeguu").append('<iframe id="dictframe" src="' + translationURL(message.term) + '" name="zeeguu" />');
        $("#contribute-from").val(message.term);
        $("#contribute-url").text(message.url);
        $("#contribute-context").val(message.context);

        reloadDictionaries();
    }
});

browser.addMessageListener("EXDICT_UPDATE_TRANSLATION_FROM_SELECTION", function(message) {
    if (contributed) {
        return;
    }
    $("#contribute-text").val(message.new_translation);
});

addStateChangeListener("links", function(links) {
    $("#toggle-links").toggleClass("enabled", !links);
});

function contributeAction() {
    if (contributed) {
        return;
    }
    var translation_in_window = $("#contribute-text").val();
    var term_in_window = $("#contribute-from").val();
    var context_in_window = $("#contribute-context").val();

    if (translation_in_window.length === 0) {
        return;
    }
    contribute_with_context(term_in_window, url, context_in_window, translation_in_window, document.title);
    //contribute(term, translation);
    $("#contribute-text").val("Word & example uploaded!").prop("disabled", true).addClass("success");
    $("#contribute-btn").addClass("disabled");
    contributed = true;

    browser.sendMessage("close");

}

$(function() {


    $("#contribute-btn").click(contributeAction);


    $("#contribute-text").keypress(function (e) {
      if (e.which == 13) {  // The return key
        contributeAction();
      }
    });

    $("#search-btn").click(redisplaySearchResults);
    $("#contribute-from").keypress(function (e) {
        if (e.which == 13) {  // The return key
            redisplaySearchResults();
        }
    });

    $("#toggle-links").click(function() {
        browser.sendMessage("update_state", {
            links: !state.links
        });
    });

    $("#close-popup-button").click(function() {
        browser.sendMessage("close");
    });

    $("#contribute-text").focus();
});
