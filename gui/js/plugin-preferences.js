$(function() {
    loadState(function() {

        if (!state.email) {
            $("#top-search-box").hide()
        }
        console.log(state);
        $("#from_lang").val(state.from);
        $("#base_language").val(state.base_language);
        $("#user_email").val(state.email);
        $("#work_before_play").prop('checked', state.work_before_play);

        state.whitelisted_domains.map(function(domain) {
            $("#whitelisted_domains").append(new Option(domain, domain));
        });

    });

    function success_message(message) {
        $("#success").innerHTML = message;
        $("#success").show().delay(1000).fadeOut();
    }

    var from_lang_update = function() {
        var newDict = default_dict_url($("#from_lang").val(), $("#base_language").val());
        browser.sendMessage("update_state", {
            from: $("#from_lang").val()
//            ,dictUrl: newDict
        });

        success_message("Well done!");
    };

    $("#from_lang").change(from_lang_update);

    $("#save").click(function() {
        var newDict = state.dictUrl;
        console.log($("#base_language").val());
        var from_changed = (state.from !== $("#from_lang").val());
        var base_changed = (state.base_language !== $("#base_language").val());
        if (from_changed || base_changed) {
            newDict = default_dict_url($("#from_lang").val(), $("#base_language").val());
        };

        browser.sendMessage("update_state", {
            from: $("#from_lang").val(),
            base_language: $("#base_language").val(),
            work_before_play: $("#work_before_play").prop('checked'),
            dictUrl: newDict
        });
        $("#success").show();
        return false;
    });

    $("#logout").click(function() {
        browser.sendMessage("update_state", {
            session : null,
            email: '',
            from: '',
            base_language: '',
            dictUrl: ''
        });
        browser.closeOptionsPage();
        return false;
    });
});



