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
        name:"Leo",
        url:"http://dict.leo.org/ende/index_de.html#/search={query}"},

    {
        name: "WordReference",
        url: "http://www.wordreference.com/deen/{query}"
    }
];

var url = 'http://zeeguu.unibe.ch/static/json/dict.json';
//var url = 'http://localhost:9000/static/json/dict.json';
$.getJSON( url, function( data ) {
    var items = [];
    $.each( data, function( key, val ) {
        alert(val.length);
        alert(key);
        console.log(key + " " + val);
    });
});


function load_dictionaries_select(language) {
    var dict = $("#dict");
    dict.empty();
    $.each(dicts[language], function() {
        dict.append($("<option />").val(this.url).text(this.name));
    });
}

function load_dict_url(url) {
    $("#dict_url").html(url);
}

$(function() {
    loadState(function() {

        $("#from_lang").val(state.from);
            load_dictionaries_select(state.from);
        $("#dict").val(state.dict);
           load_dict_url($("#dict").val());
        $("#user_email").val(state.email);
    });

    $("#save").click(function() {
        browser.sendMessage("update_state", {
            dict: $("#dict").val(),
            from: $("#from_lang").val()
        });
        $("#success").show();
        return false;
    });

    $("#reset").click(function() {
        browser.sendMessage("reset_state");
        $("#success").show();
        return false;
    });

    $("#logout").click(function() {
        browser.sendMessage("update_state", {
            session : null,
            email: '',
            from: '',
            dict: ''
        });
        $("#success").show();
        return false;
    });

    $("#from_lang").change(function() {
        load_dictionaries_select(this.value);
        load_dict_url($("#dict").val());
    } );

    $("#dict").change( function () {
        load_dict_url(this.value);
    });
});



