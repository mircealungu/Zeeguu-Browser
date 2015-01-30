var ANIMATION_SPEED = 100,
    HEIGHT = 541,
    WIDTH = 740;

var highlight_when_unhighlighting = false,
    zeeguu_active = false,
    selection_mode = false;

var translationOverlay = document.createElement('div');
translationOverlay.setAttribute('class', 'selection_bubble');
document.body.appendChild(translationOverlay);


// Test whether the page contains the language we
// are learning
var page_contains_learned_language = false;

loadState(function() {
    textContent = $("body").text();
    guessLanguage.detect(textContent, function (language) {
        page_contains_learned_language = language == state.from;
    })
});




/*
  This is required to populate the popup window
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
    var context = extract_context(surroundingParagraph);
    var title = document.getElementsByTagName("title")[0].innerHTML;

    return {
        "term": term,
        "context": context,
        "url": document.URL,
        "title": title
    };
}


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

    // The dictionary frame
    if (window.name == "zeeguu") {
        $(document).mouseup(function() {
            var selection = browser.getSelection();
            var message = term_context_url_triple(selection);
            if (message === null) {
                return;
            }
            browser.sendMessage("contribute", message);
        });

        addStateChangeListener("links", function(links) {
            toggle_selection_mode(!links);
        });

        toggle_selection_mode(!state.links);


    // Any frame
    } else {

        $(document).mouseup(function(eventData) {
            if (state.selectionMode) {
            }
        }).click(function() {
            if (zeeguu_active) {
                browser.sendMessage("close");
            }
        }).dblclick(function(eventData) {
            if (state.fast) {
            }
        });

        $(function() {
            if (state.selectionMode) {
                toggle_selection_mode(true);
            }
        });

        browser.addMessageListener("ZM_SHOW_TRANSLATION", function(data) {

            zeeguu_active = true;
            var selection = term_context_url_triple(browser.getSelection());

            if (selection !== null) {
                // this is the magic regex for splitting in sentences which often works for english.
                data.context = $.trim(selection.context.match(/\(?[^\.!\?]+[\.!\?]\)?/g).filter(function(each){return each.indexOf(data.term)>=0;})[0])
                highlight_when_unhighlighting = true;
            }
        });

        addStateChangeListener("selectionMode", function(selectionMode) {
            toggle_selection_mode(selectionMode);
        });

        browser.addMessageListener("unhighlight", function(data) {
            unhighlight();
        });

        function translate_word_action(data) {
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
            zeeguu_open = true;
            browser.sendMessage("unhighlight");
            browser.sendMessage("update_state", {
                selectionMode: false
            });
            window.setTimeout(function() {
                dont_close = true;  // Abort the closing timer if it was started after this interaction
            }, 200);
        };


        /************************************

         This is the  context of the
         original page.

        *************************************/

        if (window.top == window.self) {


            function mouse_up_in_page(e) {

                var word_to_lookup = window.getSelection().toString();
                var selection_is_interesting = word_to_lookup.trim().length > 0
                                               && word_to_lookup.length < 64;

                if ((e.altKey && selection_is_interesting)
                    || (state.fast && selection_is_interesting && page_contains_learned_language)) {

                    var message = term_context_url_triple(browser.getSelection());
                    renderBubble(e.pageX, e.pageY);

                    /*
                     This function is called after and if we get
                     a translation from the DB
                     */
                    function update_bubble_with_translation(translation) {
                        if (translation) {

                            var more = document.createElement('span');
                            console.log(document.URL);
                            if (document.URL.lastIndexOf("https", 0) != 0) {
                                more.style.cssText = "margin-left: 16px; float: right; color: gray;";
                                more.className= "translation-popup-link";
                                more.innerHTML = ' <a href="javascript:void(0)">...</a> ';
                                more.addEventListener('mouseup', function (e) {
                                    /*
                                     I guess here we must send a message from
                                     the page that will be intercepted by the
                                     plugin to open the full dictionary if one
                                     exists...
                                     */

                                    var script = document.createElement("script");
                                    message.type = "PAGE_NEEDS_WORD_TRANSLATION";

                                    script.innerHTML = 'window.postMessage(' + JSON.stringify(message) + ', "*");';
                                    document.body.appendChild(script);
                                });
                            }

                            var save = document.createElement('span');
//                            save.style.cssText="float:left";
                            save.className= "translation-popup-link";
                            save.innerHTML = '<a href="javascript:void(0)"><i class="fa fa-cloud-upload"></i></a> ';
                            save.addEventListener('mouseup', function (e) {
                                /*
                                 I guess here we must send a message from
                                 the page that will be intercepted by the
                                 plugin to open the full dictionary if one
                                 exists...
                                 */
                                translationOverlay.style.visibility = 'hidden';

                                var script = document.createElement("script");
                                message.type = "PAGE_NEEDS_WORD_TO_BE_UPLOADED";
                                message.translation = translation;

                                script.innerHTML =
                                    'window.getSelection().empty();' +
                                    'window.postMessage('+JSON.stringify(message)+', "*");';
                                document.body.appendChild(script);
                            });

                            var close = document.createElement('span');
                            close.innerHTML = " (close)";
                            close.addEventListener('mousedown', function (e) {
                                translationOverlay.style.visibility = 'hidden';
                            });

                            var ok = document.createElement('span');
                            ok.innerHTML = ' (<a href="javascript:void(0)" onclick="">ok</a>)';

                            /*

                             Until here, we've prepared our buttons...
                             Now create the bubble.
                             */

                            translationOverlay.innerHTML = "";

                            var translation_span = document.createElement('div');
                            translation_span.style.cssText="text-align: center; margin-bottom: 10px;"
                            translation_span.innerHTML = "<b>" + translation + "</b>";

                            translationOverlay.appendChild(translation_span);
                            translationOverlay.appendChild(save);
                            translationOverlay.appendChild(more);


                        }
                    }
                    get_translation_from_db(word_to_lookup, update_bubble_with_translation);

                } else {
                    /*
                     We have clicked somewhere and deselected the
                     text. No reason for the translation to still
                     be on.
                     */
                    translationOverlay.style.visibility = 'hidden';
                    translationOverlay.innerHTML = '';
                }
            }

            /*
            Before adding the delay:
            - the translation would start popping up too
            early while the user was in the process of double-clicking
            - a selected word would be clicked, and it would still
            be somehow selected on mouseUp. this would
             */
            function delayed_mouse_up(e) {
                setTimeout(function(){
                    mouse_up_in_page(e);
                }, 50);
            }

            // Let's listen to mouseup DOM events.
            document.addEventListener('mouseup', delayed_mouse_up, false);

            // Move that bubble to the appropriate location.
            function renderBubble(mouseX, mouseY) {
                translationOverlay.innerHTML = '<small><i class="fa fa-circle-o-notch fa-spin"></i></small>';
                translationOverlay.style.top = mouseY + 16 +  'px';
                translationOverlay.style.left = mouseX + 16 + 'px';
                translationOverlay.style.visibility = 'visible';
            }

            var closingTimer;
            var dont_close = false;
            var zeeguu_open = false;

            browser.addMessageListener("ZM_SHOW_TRANSLATION", translate_word_action);

            browser.addMessageListener("close", function(data) {
                if (zeeguu_open && !closingTimer) {
                    dont_close = false;
                    window.setTimeout(function() {
                        if (!dont_close) {
                            closingTimer = null;
                            hide_zeeguu();
                            zeeguu_open = false;
                        }
                    }, 200);
                }
            });

            browser.addMessageListener("browser_action", function(data) {
                toggleSelectionModeBox(!selection_mode);
                browser.sendMessage("selection_mode", {
                    enabled: !selection_mode
                });
            });
        }
    }
});

function is_frameset() {
    return !$("body").length;
}

function hide_zeeguu(callback) {
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

function toggle_selection_mode(new_selection_mode) {
    if (selection_mode == new_selection_mode) {
        return;
    }
    if (new_selection_mode) {
        $("a").each(function(i, e) {
            e = $(e);
            e.attr("data-zeeguu-href", e.attr("href"));
            e.removeAttr("href");
        });
    } else {
        $("a").each(function(i, e) {
            e = $(e);
            e.attr("href", e.attr("data-zeeguu-href"));
            e.removeAttr("data-zeeguu-href");
        });
    }
    selection_mode = new_selection_mode;
}

loadState(function() {
    browser.ifPreference("highlight", function () {
            getUserWords(function (user_words) {
                highlight_words(user_words)
            })
        }
    );

});

var fa = document.createElement('style');
fa.type = 'text/css';
fa.textContent = '@font-face { font-family: FontAwesome; src: url("'
    + chrome.extension.getURL('lib/fa-4.3/fonts/fontawesome-webfont.woff')
    + '"); }';
document.head.appendChild(fa);


