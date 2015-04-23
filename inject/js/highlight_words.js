



function highlight_individual_word(word, parent, highlight_class) {
    /*
         . between [] is a character not a meta-character
         http://stackoverflow.com/a/10398011/1200070
     */
    var wordExtractor = new RegExp('(\\s|"|>)+(' + word + ')(\\s|,|<|"|[.])+', 'gi');
    var highlightedWord = '$1<span class='+highlight_class+' other="$2">$2</span>$3';
    parent.innerHTML = parent.innerHTML.replace(wordExtractor, highlightedWord);
}


/*
 This is the function in charge with highlighting the user's words
 we put them between the zeeguu-visited links...
 */
function highlight_words_in_page(words) {
    var allPossibleParentElements = $("p, h1, h2, h3, h4, h5, h6");

    for (var i=0, max=allPossibleParentElements.length; i < max; i++) {
        var parent = allPossibleParentElements[i];

        var textNode = parent.firstChild;
        if (textNode != null)
        /*
         Here we used to have a test on textNode being of type text (3)
         but it didn't work. so now we replace everything in all the children.
         It seems to work for now.
         */
            for (j = 0; j < words.length; j++) {
                highlight_individual_word(words[j], parent, 'zeeguu-visited');
            }
    }
}

function unhighlight_words_in_page(highlight_class) {
    $("."+highlight_class).addClass("zeeguu-remove");
    $(".zeeguu-remove").each(function() {
        var parent = this.parentNode,
            lastChild = this.lastChild,
            nextlastChild;
        parent.replaceChild(lastChild, this);
        while(this.lastChild) {
            nextlastChild = this.lastChild;
            parent.insertBefore(nextlastChild, lastChild);
            lastChild = nextlastChild;
        }
        parent.normalize();
    });
}


function change_highlight_of_page(highlight) {
    if (highlight) {
        getUserWords(function (user_words) {
            highlight_words_in_page(user_words)
        });
    } else {
        unhighlight_words_in_page("zeeguu-visited");
    }
}
