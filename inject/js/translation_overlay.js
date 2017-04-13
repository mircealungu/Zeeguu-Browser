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


function showTranslationOverlay(pageX, pageY, word_to_lookup) {
    var message = extract_contribution_from_page(browser.getSelection());
    var expanded_selection = message.term;
    renderBubble(pageX, pageY);

    /*
     This function is called after and if we get
     a translation from the DB
     */
    function update_bubble_with_translation(translation) {

        // Sometimes translation is a dict of the form {bookmark_id: 1, translation: "lala"}
//        console.log(translation);
        if (translation["translation"]) {
            translation = translation [ "translation"];
        }
//        console.log(translation);

        if (translation) {

            var more = document.createElement('div');
            if (document.URL.lastIndexOf("https", 0) != 0) {
                more.style.cssText = "font-size: 10px; padding-left: 0px; clear:both; float: left; color: gray;";
                more.className= "translation-popup-more";
                more.innerHTML = ' <a href="javascript:void(0)">More...</a> ';
//                <i class="fa fa-pencil"></i>
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

            var bookmark = document.createElement('div');
            bookmark.id = "translation-popup-bookmark";
            bookmark.className= "translation-popup-bookmark";
            bookmark.style.cssText="float:right; margin-bottom: 10px; margin-left:5px;";
            bookmark.innerHTML = '<a href="javascript:void(0)"><i class="fa fa-bookmark-o"></i></a> ';


            $(bookmark).hover(
                function() {
                    $(this).find($(".fa")).removeClass('fa-bookmark-o').addClass('fa-bookmark');
                },
                function () {
                    $(this).find($(".fa")).removeClass('fa-bookmark').addClass('fa-bookmark-o');
                }
            );


            bookmark.addEventListener('mouseup', function (ev) {
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

            var close = document.createElement('div');
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

            var translation_span = document.createElement('span');
            translation_span.style.cssText="float:left; margin-bottom: 10px;";
            translation_span.innerHTML = " <b>" + translation + "</b> ";

            translationOverlay.appendChild(translation_span);
            translationOverlay.appendChild(bookmark);
            translationOverlay.appendChild(more);


        }
    }
    get_translation_from_the_server(expanded_selection,
            message.url, message.context, message.title, update_bubble_with_translation);
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

                showTranslationOverlay(e.pageX, e.pageY, word_to_lookup);

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