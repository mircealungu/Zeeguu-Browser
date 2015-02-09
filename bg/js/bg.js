var zeeguu_window = null,
    state;

var API_URL = browser.API_URL();

var previous_url = [];


function validateSession(sessionID, callback) {
    $.get(API_URL + "validate?session=" + sessionID).done(function(data) {
        callback(data == "OK");
    }).fail(function() {
        callback(false);
    });
}

browser.addMessageListener("window", function(message, sender) {
    if (zeeguu_window) {
        chrome.windows.remove(zeeguu_window.id);
    }
    chrome.windows.create({
        url: message.url,
        width: 734,
        height: 300,
        focused: true,
        type: "popup"
    }, function(window) {
        zeeguu_window = window;
  });
});


chrome.extension.onMessage.addListener(function(message, sender) {
//    if (message.name != "window" && message.name != "update_state" && message.name != "get_state" && message.name != "get_current_url") {
    if (sender) {
        if (sender.tab) {
            if (sender.tab.id) {
                chrome.tabs.sendMessage(sender.tab.id, message);
            }
        }
    }
});



// N.B. callback will be called with info and the tab in which the menu has been activated
// the translate message is sent to the content script...
//browser.contextMenu("translate", "Translate '%s'", "selection", function(info, tab) {
//
//    var message = {content: info.selectionText};
//
//    chrome.tabs.sendMessage(tab.id, {
//        name: "ZM_SHOW_TRANSLATION_OVERLAY",
//        term: info.selectionText
//    });
//});

browser.addMessageListener("get_current_url", function(message, data, callback) {
    chrome.tabs.getSelected(null,function(tab) {
        callback(tab.url);
    });
}, true);

browser.addMessageListener("whitelist_current_url", function(message, data, callback) {
    chrome.tabs.getSelected(null,function(tab) {
        state.whitelisted_domains.push(get_domain_from_url(tab.url));
        storeState();
        chrome.tabs.reload(tab.id);
    });
}, true);

browser.addMessageListener("unwhitelist_current_url", function(message, data, callback) {
    chrome.tabs.getSelected(null,function(tab) {
        state.whitelisted_domains.splice(state.whitelisted_domains.indexOf((get_domain_from_url(tab.url))), 1 );
        storeState();
        chrome.tabs.reload(tab.id);
    });
}, true);

browser.addMessageListener("disable_icon", function(message, data, callback) {
    chrome.browserAction.setIcon({path: "/logo/48x48-bw.png"});
}, true);

browser.addMessageListener("enable_icon", function(message, data, callback) {
    chrome.browserAction.setIcon({path: "/logo/48x48.png"});
}, true);

/*
When switching tabs, we must activate or deactivate the extension
depending on the url of the tab.
 */
chrome.tabs.onActivated.addListener(function(activeInfo) {
//    console.log("tab activated!");
    chrome.tabs.getSelected(null,function(tab) {
        var url = tab.url;
        if (!is_domain_allowed(url, state.whitelisted_domains)) {
            browser.sendMessage("disable_icon");
        } else {
            browser.sendMessage("enable_icon");
        }
    });
});
