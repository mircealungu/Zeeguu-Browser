var state,
    stateChangeListeners = {};

var API_URL = browser.API_URL();

/*
  zeeguu_api_interface.js is loaded by the plugin-preferences.js, so we move here the redirect_if_preference_is_set regarding
   dictionaries and default values for them.
 */

var dictionaries = {};

/*
 A dictionary is nothing more than a pair {name: "x", url: "y"}
 Some dictionaries are defined individually, like the following:
 */

dictionaries ["de"] = {'en': [
    {
        name: 'Dict.cc',
        url: 'http://{from}-{to}.syn.dict.cc/?s={query}'
    },
    {
        name:"Beolingus",
        url:"http://dict.tu-chemnitz.de/dings.cgi?lang=en&service=deen&mini=1&query={query}"
    },
    {
        name:"Leo",
        url:"http://pda.leo.org/#/search={query}"
    }
]};

dictionaries ["en"] = {'en': [
    {
        name: "Merriam-Webster",
        url: "http://www.merriam-webster.com/dictionaries/{query}"
    }
]};

dictionaries ["no"] = {'en': [
    {
        name: "Lexin",
        url: "http://lexin.udir.no/?search={query}&dict=nbo-ru-maxi&ui-lang=NBO&startingfrom=&count=10&checked-languages=NBO&checked-languages=RU&checked-languages=B"
    }
]};

/*
 Some other dictionaries are generated, like the following
 */
var wordreference_data = {
        name: 'WordReference',
        url: 'http://www.wordreference.com/{from}{to}/{query}',
        translators: {
                        // learned language: existing dictionaries
            "en": ["ro"],
            "fr": ["de", "en"],
            "de": ["en", "ro"],
            "el": ["de", "en"],
            "es": ["de", "en"]
        }};
var sensagent_data = {
        name: 'Sensagent',
        url: 'http://translation.sensagent.com/{query}/{from}-{to}',
        translators: {  "no": ["en"]}};

var dict_cc = {
        name: 'Dict.cc',
        url: 'http://{from}-{to}.syn.dict.cc/?s={query}',
        translators: {  "de": ["ro"],
                        "es": ["de"]}};

var babla_no_data = {
    name: 'Bab.la',
    url: 'http://en.bab.la/dictionary/norwegian-english/{query}',
    translators: {
        "no": ["en"]
    }};

var babla_dk_data = {
    name: 'Bab.la',
    url: 'http://en.bab.la/dictionary/danish-english/{query}',
    translators: {
        "dk": ["en"]}};


var multi_dicts = [babla_dk_data, babla_no_data, wordreference_data, sensagent_data, dict_cc];


function make_dictionary(from, to, dict_data) {
    var bound_url = dict_data.url.replace("{from}", from)
        .replace("{to}", to)
    return {
        name: dict_data.name + " ("+from+"-"+to+")",
        url: bound_url
    }
}

function default_dict_url(from, to) {
    if (dictionaries[from]){
        if (dictionaries[from][to]) return (dictionaries[from][to][0]).url;
    }
    var result = [];
    multi_dicts.map(function(multi_dict) {
        if ($.inArray(to, multi_dict.translators[from])>-1) {
            result.push(make_dictionary(from, to, multi_dict));
        }
    });

    return result[0].url;
}

function allDictsForLanguage(from, to) {
    var result = [];
    if (dictionaries[from]) {
        if (dictionaries[from][to]) {
            dictionaries[from][to].map(function(dict) {
                result.push(dict);
            })

        }
    }

    multi_dicts.map(function(multi_dict) {
        if ($.inArray(to, multi_dict.translators[from])>-1) {
            result.push(make_dictionary(from, to, multi_dict));
        }
    });
    return result;
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

function bookmark_with_context(from_term, url, context, to_term, title) {
//    console.log(from_term + " -->> " + to_term);
    $.post(
        api_url ( ["bookmark_with_context",
                  state.from,
                  from_term,
                  state.base_language,
                  to_term ]),

        {  "context":   context,
           "url":       url,
           "title":     title});
}

function get_translation_from_the_server(word_to_lookup, func_that_uses_translation) {
    $.post(
        api_url(["translate",
                state.from,
                state.base_language]),
            {
                "context": ",,",
                "url": "..",
                "word":(encodeURIComponent(word_to_lookup))
            }
    ).done(
        function(translation)
            {func_that_uses_translation(translation)}
    ).fail(
        function()
            {func_that_uses_translation(false)}
    );
}

function getLanguages(sessionID, callback) {
    $.get(API_URL+"learned_and_native_language?session="+sessionID).done(function(data) {
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

        getLanguages(sessionID, function(languages) {
            browser.sendMessage("update_state", {
                "from": languages.learned,
                "base_language": languages.native,
                "dictUrl": default_dict_url(languages.learned, languages.native)
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
