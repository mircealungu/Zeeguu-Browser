var state,
    stateChangeListeners = {};

var API_URL = browser.API_URL();

/*
  zeeguu_api_interface.js is loaded by the plugin-preferences.js, so we move here the stuff regarding
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

dicts ["es"] = [
    {   name:"WordReference (Spanish-English)",
        url:"http://www.wordreference.com/esen/{query}"}
];


dicts ["el"] = [
    {
        name: "Goslate (EN)",
        url: "https://www.zeeguu.unibe.ch/goslate/{query}/el"
    },
    {
        name: "Goslate (DE)",
        url: "https://www.zeeguu.unibe.ch/goslate_from_to/{query}/el/de"
    },
    {
        name: "WordReference (En)",
        url: "http://www.wordreference.com/gren/{query}"
    }
];

dicts ["de"] = [
    {
        name:"dict.cc",
        url:"http://de-en.syn.dict.cc/?s={query}"
    },

    {
        name: "Goslate",
        url: "https://www.zeeguu.unibe.ch/goslate/{query}/de"
    },

    {
        name:"beolingus",
        url:"http://dict.tu-chemnitz.de/dings.cgi?lang=en&service=deen&mini=1&query={query}"
    },

    {
        name:"Leo",
        url:"http://pda.leo.org/#/search={query}"
    },

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
];

dicts ["en"] = [
    {
        name: "Merriam-Webster",
        url: "http://www.merriam-webster.com/dictionary/{query}"
    }
];

function default_dict(language) {
    return dicts[language][0].url;
}

function allDictsForLanguage(language) {
    return dicts[language];
};




/* Any calls to the functions below require the state to be loaded */
function loadState(callback) {
    browser.sendMessage("get_state", function(message) {
        state = message;
        callback(state);
        browser.addMessageListener("state", function(message, sender) {
            for (var i in message.state) {
                if (message.state[i] != state[i] && stateChangeListeners[i]) {
                    stateChangeListeners[i](message.state[i]);
                }
            }
            state = message.state;
        });
    });
}

function addStateChangeListener(item, callback) {
    stateChangeListeners[item] = callback;
}

function translationURL(term) {
    var url = (state.dictUrl.replace("{from}", encodeURIComponent(state.from))
                         .replace("{to}", encodeURIComponent(state.base_language))
                         .replace("{query}", encodeURIComponent(term)));
    if (!state.links) {
        url = url.replace(/($|#.*)/, (url.indexOf("?") == -1 ? "?" : "&") + "__BLA__$1");
    }
    return url;
}

/*
Constructs the url for the given API call
 and appends the session when needed.

It's important to use this function, to avoid
stupid bugs, like when I was constructing
manually the API and adding a trailing "/".
Argh!

 */
function api_url(parameters) {
    return API_URL + parameters.join("/") + "?session=" + state.session
}


function log_search(term) {
    $.post(
        api_url ( [ "lookup",
                    state.from,
                    term ,
                    state.base_language ] )
    );
}

function contribute(from_term, to_term) {
    $.post(
        api_url( ["contribute",
                 state.from,
                 from_term,
                 state.base_language,
                 to_term])
    );
}

function contribute_with_context(from_term, url, context, to_term, title) {
//    console.log(from_term + " -->> " + to_term);
    $.post(
        api_url ( ["contribute_with_context",
                  state.from,
                  from_term,
                  state.base_language,
                  to_term ]),

        {  "context":   context,
           "url":       url,
           "title":     title});
}

function get_translation_from_db(word_to_lookup, func_that_uses_translation) {
    var to_language = state.base_language;
    $.get(
        api_url(["goslate_from_to",
                word_to_lookup,
                state.from,
                to_language])
    ).done(
        function(translation)
            {func_that_uses_translation(translation)}
    ).fail(
        function()
            {func_that_uses_translation(false)}
    );
}

function getLanguage(sessionID, callback) {

    $.get(API_URL+"learned_language?session="+sessionID).done(function(data) {
        callback(data)
    }).fail(function(){
        callback(false);
    })
}

function getUserWords(callback) {
    $.get(API_URL+"user_words?session="+state.session).done(function(data) {
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
