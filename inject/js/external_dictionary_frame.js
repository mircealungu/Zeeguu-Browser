console.log(window.name);
if (window.name == "zeeguu") {
    $(document).mouseup(function () {
        var selection = browser.getSelection();
        var message = term_context_url_triple(selection);
        if (message === null) return;
        browser.sendMessage("contribute", message);
    });

//    addStateChangeListener("links", function(links) {
//        toggle_selection_mode(!links);
//    });

    disable_links();
}
