/**
 * Created by mircea on 02/02/15.
 */

function is_domain_allowed(url, whitelist) {
    var allowed = false;

    whitelist.map(function(domain) {
        var regex = new RegExp ("^" + domain);
        if (url.match(regex)) {
            allowed = true;
        }
    });
    return allowed;
}

function get_domain_from_url(anUrl) {
        var url = $.trim(anUrl);
        if(url.search(/^https?\:\/\//) != -1)
            url = url.match(/^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i, "");
        else
            url = url.match(/^([^\/?#]+)(?:[\/?#]|$)/i, "");
        return url[0];
}