$(function() {
    loadState(function() {

        if (!state.email) {
            $("#top-search-box").hide()
        }

        $("#from_lang").val(state.from);
        $("#base_language").val(state.base_language);
        $("#user_email").val(state.email);
        $("#work_before_play").prop('checked', state.work_before_play);
        $("")

        state.whitelisted_domains.map(function(domain) {
            $("#whitelisted_domains").append(new Option(domain, domain));
        });

    });

    $("#save").click(function() {
        browser.sendMessage("update_state", {
            from: $("#from_lang").val(),
            base_language: $("#base_language").val(),
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
            base_language: '',
            dictUrl: ''
        });
        browser.closeOptionsPage();
        return false;
    });
});



