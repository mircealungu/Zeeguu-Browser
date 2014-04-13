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
//        $("#dict_url").val(state.dict_url);

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

    $("#from_lang").change(function() {
        load_dictionaries_select(this.value);
        load_dict_url($("#dict").val());
    } );

    $("#dict").change( function () {
        load_dict_url(this.value);
    });
});



