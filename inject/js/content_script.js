
var highlight_when_unhighlighting = false,
    external_dictionary_active = false,
    selection_mode = false;



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

        $(document).mouseup(function(eventData) {
            if (state.selectionMode) {
            }
        }).click(function() {
            /*
            closing the external dict if the user clicks
            anywhere in the page
             */
            if (external_dictionary_active) {
                browser.sendMessage("close");
            }
        }).dblclick(function(eventData) {
            if (state.fast) {
            }
        });

        if (state.selectionMode) {
            toggle_selection_mode(true);
        }


        addStateChangeListener("selectionMode", function(selectionMode) {
            toggle_selection_mode(selectionMode);
        });

        browser.addMessageListener("unhighlight", function(data) {
            unhighlight();
        });


        /************************************

         This is the  context of the
         original page.

        *************************************/

        if (window.top == window.self) {


            function mouse_up_in_page(e) {

                var word_to_lookup = window.getSelection().toString();
                var selection_is_interesting = word_to_lookup.trim().length > 0
                                               && word_to_lookup.length < 64;

                /*
                The external_dictionary_active condition here is a bit sketchy
                but I didn't find another way to make sure that the
                translation overlay does not appear again after the
                ext dict is displayed.
                 */
                if ((e.altKey && selection_is_interesting && external_dictionary_active == false)
                    || (state.fast && selection_is_interesting && page_contains_learned_language
                        && external_dictionary_active == false)) {

                    var message = extract_contribution_from_page(browser.getSelection());
                    renderBubble(e.pageX, e.pageY);

                    /*
                     This function is called after and if we get
                     a translation from the DB
                     */
                    function update_bubble_with_translation(translation) {
                        if (translation) {

                            var more = document.createElement('span');
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


            browser.addMessageListener("ZM_SHOW_TRANSLATION", show_external_dictionary);
            browser.addMessageListener("close", close_external_dictionary);

            browser.addMessageListener("browser_action", function(data) {
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


