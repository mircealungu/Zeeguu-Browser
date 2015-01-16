/**
 * Created by mircea on 15/01/15.
 */

/*
 work before play makes no sense if the user
 has no words in his profile. this could be
 tested every time the tab is updated, but it
 would be too much of a performance nuissance
 so we test this only the first time the bg.js
 is loaded. this clearly can be improved in the
 future
 */
var user_has_words = false;


// Some mess we've got ourselves in here...
// the bg.js overwrites the state variable
// from the zeeguu_api_interface
getState(function(state) {
    getUserWords(function (data) {
        if (data.length > 3) {
            user_has_words = true;
        }
    });
});

/*
 onUpdated gets fired when the user presses return
 in the address field of a tab
 */
chrome.tabs.onUpdated.addListener (
    function(tabId, changeInfo, tab) {
        browser.ifPreference("work_before_play", function() {
            if (user_has_words) {
                var fb_pattern = /^https:\/\/www.facebook.com/i;
                var new_web_address = changeInfo.url;

                if (new_web_address) {
                    if (!previous_url[tabId])
                        previous_url[tabId] = "nothing";

                    if (new_web_address.match(fb_pattern) && !(previous_url[tabId].match(fb_pattern))) {
                        previous_url[tabId] = tab.url;
                        chrome.tabs.update({url: API_URL + "study_before_play?to=" + encodeURIComponent(new_web_address)});
                    }
                }
            }
        })
    }
);


/*
 Remove the history info from previous_url
 when a tab is closed. Although, I am not
 sure that this is really cool. After all,
 if the user was just on FB, got out and
 wants to go back in, he might be anoyed.
 Still, better than having the extension be
 inconsistent.
 */
chrome.tabs.onRemoved.addListener (
    function(tabId, removeInfo) {
        browser.ifPreference("work_before_play", function() {
            if (user_has_words) {
                previous_url[tabId] = "nothing";
            }
        })});