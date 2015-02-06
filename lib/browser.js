/*
 * This file contains all browser-specific functions.
 * Note that currently only Google Chrome's functions are complete and tested.
 */

var browser,
    NotImplementedError = function() {
        throw Error("NotImplementedError");
    };

/* Safari */
if (typeof safari !== "undefined") {
    // TODO: Handle possible concurrency errors
    var settingsCallbacks = [],
        settings;

    safari.self.addEventListener("message", function(e) {
        if (e.name == "settings") {
            settings = e.message;
            for (var i in settingsCallbacks) {
                settingsCallbacks[i](e.message);
            }
            console.log("got");
        }
    }, false);

    browser = {
        getSettings: function(keys, callback) {
            if (settings) {
                callback(settings);
                return;
            } else if (settingsCallbacks.length === 0) {
                safari.self.tab.dispatchMessage("get_settings", keys);
            }
            settingsCallbacks.push(callback);
            console.log("get");
        },
        setSettings: function(map) {
            safari.self.tab.dispatchMessage("set_settings", map);
        },
        sendMessage: NotImplementedError,
        addMessageListener: NotImplementedError,
        getSelection: NotImplementedError,
        zeeguuEncodeUrl: NotImplementedError,
        contextMenu: NotImplementedError,
        setToolbarBadge: NotImplementedError,
        newTab: NotImplementedError
    };

/* Chrome */
} else if ( typeof chrome !== "undefined") {
    browser = {
        getSettings: function(key, callback) {
            chrome.storage.sync.get(key, callback);  // This is necessary because of JavaScript's scoping issues
        },
        ifPreference: function(preference, callback) {
            chrome.storage.sync.get(preference, function(preference_dict) {
                if (preference_dict[preference] == true) {
                    callback();
                }
            });
        },
        setSettings: function(map) {
            chrome.storage.sync.set(map);
        },
        sendMessage: function(name, data, response) {
            if (typeof data == "function") {
                response = data;
                data = {};
            } else if (data === undefined) {
                data = {};
            }
            data.name = name;
            if (response) {
                chrome.extension.sendMessage(data, response);
            } else {
                chrome.extension.sendMessage(data);  // Just passing undefined as the second argument results in a argument normalization error.
            }
        },
        addMessageListener: function(name, callback, respond) {
            if (typeof name == "string") {
                name = [name];
            }
            chrome.extension.onMessage.addListener(function(message, sender, response) {
                if (name.indexOf(message.name) >= 0) {
                    callback(message, sender, response);
                }
                return respond !== undefined;
            });
        },
        broadcast: function(name, data) {
            data = data || {};
            data['name'] = name;
            chrome.windows.getAll({
                populate: true
            }, function(windows) {
                for(var i in windows) {
                    for (var j in windows[i].tabs) {
                        chrome.tabs.sendMessage(windows[i].tabs[j].id, data);
                    }
                }
            });
        },
        getSelection: function() {
            return window.getSelection();
        },
        getSelectionCoordinates: function() {
            var range = window.getSelection().getRangeAt(0);

            var dummy = document.createElement("span");
            range.insertNode(dummy);
            pos = $(dummy).position();
            dummy.parentNode.removeChild(dummy);
            return pos;
        },
        withSelectedTextDo: function(callback) {
            var selection = browser.getSelection().toString();
            if (selection === null) return;
            callback(selection);
        },
        closeOptionsPage: function() {
            chrome.tabs.getCurrent(function(tab) {
                chrome.tabs.remove(tab.id, function() { });
            });
        },
        /*

         */
        zeeguuEncodeUrl: function(term, url, context, title) {
            // AAAARGH! this truly is an amazing language. if you leave a space after return
            // and then add another expression after it will return None
            encoded = chrome.extension.getURL("gui/html/ext_dict_frame.html") + '?' +
                encodeURIComponent(term.replace(/\ /g, "+") + " " + url + " " + context.replace(/\ /g, "+") + " " + title.replace(/\ /g, "+"));
            return encoded;
        },
        zeeguuDecodeURL: function(url) {
            var message = {};
            var query = decodeURIComponent(window.location.search);
            var first_space_pos = query.indexOf(" ");
            if (first_space_pos < 0) {
                window.location = "error.html";
                return null;
            }
            /*
             Spaces are replaced with +es on when the frame is opened.
             Here we change them back.
             */
            console.log(query);
            message.term = query.substr(1, first_space_pos - 1).replace(/\+/g, " ");
            var second_space_pos = query.indexOf(" ", first_space_pos+1);
            var third_space_pos = query.indexOf(" ", second_space_pos+1);
            message.url = query.substr(first_space_pos+1, second_space_pos - first_space_pos - 1);
            message.context = query.substr(second_space_pos + 1, third_space_pos - second_space_pos - 1).replace(/\+/g, " ");;
            message.title = query.substr(third_space_pos + 1).replace(/\+/g, " ");;
            return message;
        },
        contextMenu: function(id, label, contexts, callback) {
            if (typeof contexts == "string") {
                contexts = [contexts];
            }
            chrome.contextMenus.create({
                id: id,
                title: label,
                contexts: contexts
            });
            chrome.contextMenus.onClicked.addListener(callback);
        },
        setToolbarBadge: function(text) {
            chrome.browserAction.setBadgeText({
                text: text
            });
        },
        newTab: function(url) {
            chrome.tabs.create({
                url: url
            });
        },
        API_URL: function() {
            return "https://www.zeeguu.unibe.ch/";
//            return "http://127.0.0.1:8080/";
        }
    };
}
