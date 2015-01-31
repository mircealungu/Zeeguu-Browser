/*
 This is the function in charge with highlighting the user's words
 we put them between the zeeguu-visited links...
 */
function highlight_words(words) {

    var all = document.querySelectorAll('p');

    for (var i=0, max=all.length; i < max; i++) {
        var parent = all[i];

        var textNode = parent.firstChild;
        if (textNode != null)
        /*
         Here we used to have a test on textNode being of type text (3)
         but it didn't work. so now we replace everything in all the children.
         It seems to work for now.
         */
            for (j = 0; j < words.length; j++) {
                var rgxp = new RegExp(' (' + words[j]+')( |,|[.])', 'gi');
                var repl = ' <span class="zeeguu-visited" other="$1">$1$2</span> ';
                parent.innerHTML = parent.innerHTML.replace(rgxp, repl);
            }
    }
}

function unhighlight_words() {
    $(".zeeguu-visited").addClass("zeeguu-remove");
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
            highlight_words(user_words)
        });
    } else {
        unhighlight_words();
    }
}
