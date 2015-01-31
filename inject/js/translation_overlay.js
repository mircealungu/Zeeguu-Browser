var translationOverlay = document.createElement('div');
translationOverlay.setAttribute('class', 'selection_bubble');
document.body.appendChild(translationOverlay);


// Move that bubble to the appropriate location.
function renderBubble(mouseX, mouseY) {
    translationOverlay.innerHTML = '<small><i class="fa fa-circle-o-notch fa-spin"></i></small>';
    translationOverlay.style.top = mouseY + 16 +  'px';
    translationOverlay.style.left = mouseX + 16 + 'px';
    translationOverlay.style.visibility = 'visible';
}


function mouse_up_in_page(e, external_dictionary_active) {

    var word_to_lookup = window.getSelection().toString();
    var selection_is_interesting = word_to_lookup.trim().length > 0
        && word_to_lookup.length < 96;

    /*
     The external_dictionary_active condition here is a bit sketchy
     but I didn't find another way to make sure that the
     translation overlay does not appear again after the
     ext dict is displayed.
     */
    if ((e.altKey && selection_is_interesting && external_dictionary_active == false)
        || (state.fast && selection_is_interesting
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
                    more.addEventListener('mouseup', function (ev) {
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
                save.addEventListener('mouseup', function (ev) {
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
                close.addEventListener('mousedown', function (ev) {
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
                translation_span.style.cssText="text-align: center; margin-bottom: 10px;";
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