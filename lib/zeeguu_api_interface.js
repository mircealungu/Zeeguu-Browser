//var API_URL = "http://localhost:8080/";  // This is also stored in bg/js/bg.js
var API_URL = "https://www.zeeguu.unibe.ch/";  // This is also stored in lib/zeeguu_api_interface.js
var state,
    stateChangeListeners = {};

//state.from = 'en';
//state.to = 'de';
//state.dictUrl = 'http://www.wordreference.com


/*
  zeeguu_api_interface.js is loaded by the options.js, so we move here the stuff regarding
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
]

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
                    state.to ] )
    );
}

function contribute(from_term, to_term) {
    $.post(
        api_url( ["contribute",
                 state.from,
                 from_term,
                 state.to,
                 to_term])
    );
}

function contribute_with_context(from_term, url, context, to_term) {

    $.post(
        api_url ( ["contribute_with_context",
                  state.from,
                  from_term,
                  state.to,
                  to_term ]),

        {  "context":context,
           "url":url});
}

function get_translation_from_db(from_term, callback) {
    $.get(
        api_url(["goslate_from_to",
                from_term,
                state.from,
                state.to])
    ).done(
        function(translation)
            {callback(translation)}
    ).fail(
        function()
            {callback(false)}
    );
}

function getLanguage(sessionID, callback) {

    $.get(API_URL+"learned_language?session="+sessionID).done(function(data) {
        callback(data)
    }).fail(function(){
        callback(false);
    })
}

function getUserWords(sessionID, callback) {
//    console.log("---- GET: "+API_URL+"user_words?session="+sessionID)
    $.get(API_URL+"user_words?session="+sessionID).done(function(data) {
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