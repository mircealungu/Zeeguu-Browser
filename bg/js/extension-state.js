/**
 * Created by mircea on 02/02/15.
 */
var PERSITENT_PREFERENCES_KEYS = ["dictUrl",
    "from",
    "base_language",
    "links",
    "fast",
    "session",
    "email",
    "highlight",
    "work_before_play",
    "whitelisted_domains"];

function getState(callback) {
    if (state) {
        if (callback) {
            callback(state);
        }
        return;
    }
    browser.getSettings(PERSITENT_PREFERENCES_KEYS, function(items) {
        state = fillStateWithDefaults(items);
        if (callback) {
            callback(state);
        }
    });
}

function storeState() {
    var persitentState = {};
    $.each(state, function(i, v) {
        if (PERSITENT_PREFERENCES_KEYS.indexOf(i) >= 0) {
            persitentState[i] = v;
        }
    });
    browser.setSettings(persitentState);
    browser.broadcast("state", {
        state: state
    });
}

function fillStateWithDefaults(state) {
    return $.extend({
        dictUrl: "http://{from}-{to}.syn.dict.cc/?s={query}",
        from: "de",
        base_language: "en",
        highlight: false,
        session: null,
        links: false,
        fast: false,  // translate with double-click
        selectionMode: false,
        work_before_play: true,
        whitelisted_domains: []
    }, state);
}


getState(function(state) {
    validateSession(state.session, function(valid) {
        if (!valid) {
            state.session = null;
            storeState();
        }
    });
});

browser.addMessageListener("get_state", function(message, sender, response) {
    getState(function(state) {
        response(state);
    });
}, true);

browser.addMessageListener("update_state", function(message) {
    $.extend(true, state, message);
    browser.setToolbarBadge(state.selectionMode ? "!" : "");
    storeState();
});

browser.addMessageListener("reset_state", function(message) {
    state = fillStateWithDefaults({});
    browser.setToolbarBadge(state.selectionMode ? "!" : "");
    storeState();
});



