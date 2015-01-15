

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

        if (!state.email) {
            $("#top-search-box").hide()
        }

        $("#from_lang").val(state.from);
            load_dictionaries_select(state.from);
        $("#dict").val(state.dictUrl);
           load_dict_url($("#dict").val());
        $("#user_email").val(state.email);
        $("#work_before_play").prop('checked', state.work_before_play);
        $("")
    });

    $("#save").click(function() {
        browser.sendMessage("update_state", {
            dictUrl: $("#dict").val(),
            from: $("#from_lang").val(),
            work_before_play: $("#work_before_play").prop('checked')
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
            dictUrl: ''
        });
        browser.closeOptionsPage();
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



