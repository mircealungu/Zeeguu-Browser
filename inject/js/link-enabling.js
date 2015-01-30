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