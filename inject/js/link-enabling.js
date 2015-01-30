function disable_links() {
    $("a").each(function (i, e) {
        e = $(e);
        e.attr("data-zeeguu-href", e.attr("href"));
        e.removeAttr("href");
    });
};

function enable_links() {
    $("a").each(function(i, e) {
        e = $(e);
        e.attr("href", e.attr("data-zeeguu-href"));
        e.removeAttr("data-zeeguu-href");
    });
}

function toggle_selection_mode(new_selection_mode) {
    if (selection_mode == new_selection_mode) {
        return;
    }
    if (new_selection_mode) {
        disable_links();
    } else {
        enable_links();
    }
    selection_mode = new_selection_mode;
}
