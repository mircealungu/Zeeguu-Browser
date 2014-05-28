//var API_URL = "http://localhost:9000/";  // This is also stored in bg/js/bg.js
var API_URL = "http://zeeguu.unibe.ch/";  // This is also stored in lib/zeeguu.js
var state,
    stateChangeListeners = {};

//state.from = 'en';
//state.to = 'de';
//state.dictUrl = 'http://www.wordreference.com


/*
  zeeguu.js is loaded by the options.js, so we move here the stuff regarding
   dictionaries and default values for them.
 */
dicts = [];
dicts ["fr"] = [
    {   name:"WordReference",
        url:"http://www.wordreference.com/fren/{query}"}
];

dicts ["it"] = [
    {   name:"WordReference",
        url:"http://www.wordreference.com/iten/{query}"}
];

dicts ["de"] = [
    {
        name:"dict.cc",
        url:"http://de-en.syn.dict.cc/?s={query}"},

    {
        name:"beolingus",
        url:"http://dict.tu-chemnitz.de/dings.cgi?lang=en&service=deen&mini=1&query={query}"},
    {
        name:"Leo",
        url:"http://dict.leo.org/ende/index_de.html#/search={query}"},

    {
        name: "WordReference",
        url: "http://www.wordreference.com/deen/{query}"
    },
    {
        name: "Sensagent",
        url: "http://dictionary.sensagent.com/{query}/de-en/"
    }
];

dicts ["no"] = [
    {
        name: "Sensagent",
        url: "http://dictionary.sensagent.com/{query}/no-en/"
    }
]
dicts ["en"] = [
    {
        name: "Merriam-Webster",
        url: "http://www.merriam-webster.com/dictionary/{query}"
    }
]

function default_dict(language) {
    return dicts[language][0].url;
}

function allDictsForLanguage(language) {
    return dicts[language];
};

console.log(default_dict("no"));

//default_dict =[];
//default_dict["de"] = "http://www.wordreference.com/deen/{query}";
//default_dict["it"] = "http://www.wordreference.com/iten/{query}";
//default_dict["fr"] = "http://www.wordreference.com/fren/{query}";
//default_dict["en"] = "http://www.merriam-webster.com/dictionary/{query}"


/* Any calls to the functions below require the state to be loaded */
function loadState(callback) {
    browser.sendMessage("get_state", function(message) {
        state = message;
        console.log(state);
        callback(state);
        browser.addMessageListener("state", function(message, sender) {
            for (var i in message.state) {
                if (message.state[i] != state[i] && stateChangeListeners[i]) {
                    stateChangeListeners[i](message.state[i]);
                }
            }
            state = message.state;
            console.log(message, sender);
        });
    });
}

function addStateChangeListener(item, callback) {
    stateChangeListeners[item] = callback;
}

function translationURL(term) {
    var url = (state.dictUrl.replace("{from}", encodeURIComponent(state.from))
                         .replace("{to}", encodeURIComponent(state.to))
                         .replace("{query}", encodeURIComponent(term)));
    if (!state.links) {
        url = url.replace(/($|#.*)/, (url.indexOf("?") == -1 ? "?" : "&") + "__BLA__$1");
    }
    return url;
}

function log_search(term) {
    $.post(API_URL + "lookup/" + state.from + "/" + term + "/" + state.to + "?session=" + state.session);
}

function contribute(from_term, to_term) {
    $.post(API_URL + "contribute/" + state.from + "/" + from_term + "/" + state.to + "/" + to_term + "?session=" + state.session);
}

function contribute_with_context(from_term, url, context, to_term) {
    $.post(API_URL + "contribute_with_context/" + state.from + "/" + from_term +
        "/" + state.to + "/" + to_term +
        "?session=" + state.session,
        {"context":context,"url":url});
}

function getLanguage(sessionID, callback) {
    console.log("---- GET: "+API_URL+"learned_language?session="+sessionID)
    $.get(API_URL+"learned_language?session="+sessionID).done(function(data) {
        callback(data)
    }).fail(function(){
        callback(false);
    })
}

function is_logged_in() {
    return state.session !== null;
}

function login(email, password, callback) {
    $.post(API_URL + "session/" + encodeURIComponent(email), {
        password: password
    })
    .done(function(data) {
        var sessionID = parseInt(data, 10);
        browser.sendMessage("update_state", {
            "session": sessionID
        });

        getLanguage(sessionID, function(language) {
            browser.sendMessage("update_state", {
                "from": language,
                "dictUrl": default_dict(language)
            });
            console.log("got the language" + language);
            console.log("set the default dict" + default_dict(language));

            callback(true);
        });

    })
    .fail(function() {
        callback(false);
    });
}

function register(email, password, callback) {
    $.post(API_URL + "adduser/" + encodeURIComponent(email), {password: password})
    .done(function(data) {
        sessionID = parseInt(data, 10);
        browser.sendMessage("update_state", {
            "session": sessionID
        });
        callback(true);
    })
    .fail(function() {
        callback(false);
    });
}
