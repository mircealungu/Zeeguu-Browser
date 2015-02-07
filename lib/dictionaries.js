var dictionaries = {};

/*
 A dictionary is nothing more than a pair {name: "x", url: "y"}
 Some dictionaries are defined individually, like the following:
 */

dictionaries ["de"] = {'en': [
    {
        name:"beolingus",
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

/*
 Some other dictionaries are generated, like the following
 */
var wordreference_data = {name: 'WordReference', url: 'http://www.wordreference.com/{from}{to}/{query}'};
var sensagent_data = {name: 'Sensagent', url: 'http://translation.sensagent.com/{query}/{from}-{to}'};
var dict_cc = {name: 'Dict.cc', url: 'http://{from}-{to}.syn.dict.cc/?s={query}'};


function make_dictionary(from, to, dict_data) {
    var bound_url = dict_data.url.replace("{from}", from)
        .replace("{to}", to)
    return {
        name: dict_data.name + " ("+from+"-"+to+")",
        url: bound_url
    }
}

function default_dict(from, to) {
    if (dictionaries[from][to]) return dictionaries[from][to][0];
    var result  = make_dictionary(from, to, wordreference_data);
    console.log(result);
    return result;
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
    result.push(make_dictionary(from, to, dict_cc));
    result.push(make_dictionary(from, to, wordreference_data));
    result.push(make_dictionary(from, to, sensagent_data));
    console.log(result);
    return result;
};
