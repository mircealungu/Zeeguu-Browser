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
        $("#work_before_twitter").prop('checked', state.work_before_twitter);
        $("#work_before_gmail").prop('checked', state.work_before_gmail);

        state.whitelisted_domains.map(function(domain) {
            $("#whitelisted_domains").append(new Option(domain, domain));
        });

    });

    function flash_success_message() {
        $("#error").hide();
        $("#success").show().fadeOut(50).fadeIn(50);
    }
    function flash_warning_message(message) {
        $("#success").hide();
        $("#error").html(message);
        $("#error").show().fadeOut(50).fadeIn(500);
    }

    var from_lang__change = function() {
        try {
            var newDict = default_dict_url($("#from_lang").val(), $("#base_language").val());
            browser.sendMessage("update_state", {
                from: $("#from_lang").val(),
                dictUrl: newDict
            });
            flash_success_message();
        } catch (err) {
            flash_warning_message("Seems like this language combination is not supported");
        }
    };

    var base_lang__change = function() {
        try {

            var newDict = default_dict_url($("#from_lang").val(), $("#base_language").val());
            browser.sendMessage("update_state", {
                base_language: $("#base_language").val(),
                dictUrl: newDict
            });
            flash_success_message();
        } catch (err) {
            flash_warning_message("Seems like this language combination is not supported");
        }
    };

    var work_before_play__change = function() {
        var status = $("#work_before_play").is(':checked');
        browser.sendMessage("update_state", {
            work_before_play: status });
        flash_success_message();
    };

    var work_before_twitter__change = function() {
        var status = $("#work_before_twitter").is(':checked');
        browser.sendMessage("update_state", {
            work_before_twitter: status });
        flash_success_message();
    };

    var work_before_gmail__change = function() {
        var status = $("#work_before_gmail").is(':checked');
        browser.sendMessage("update_state", {
            work_before_gmail: status });
        flash_success_message();
    };

    $("#from_lang").change(from_lang__change);
    $("#base_language").change(base_lang__change);
    $("#work_before_play").change(work_before_play__change);
    $("#work_before_twitter").change(work_before_twitter__change);
    $("#work_before_gmail").change(work_before_gmail__change);


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



