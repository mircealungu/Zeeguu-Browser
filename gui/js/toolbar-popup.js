
$(function() {
    $("#translate").focus();  // This doesn't do anything due to a bug in Chrome.
                              // Instead the 'tabindex' attribute is used to achieve the same effect.


        var originalHelp = $("#help").text();

        function setHelp(selector, helpText) {
            $(selector).on("mouseover focus", function() {
                $("#help").text(helpText);
            }).on("mouseout blur", function() {
                $("#help").text(originalHelp);
            });
        }
        function set_the_help_for_buttons() {
            setHelp("#fast-mode", "Translate by double-clicking");
            setHelp("#selection-mode", "Disable page links for easier selection");
            setHelp("#highlighting-mode", "Highlight the learned words");
            setHelp("#to-the-gym", "Practice at the Language Gym");
            setHelp("#to-the-word-list", "To your words list");
            setHelp("#options-btn", "Edit plugin options");
            setHelp("#to-the-help-page", "Email us a question about Zeeguu");
        }


    loadState(function() {
            /* Helper functions ... */
            function redirect_to_login_if_needed() {
                /*
                 if the popup is called by a user who is not logged in,
                 we forward to the login.html which will be loaded in this
                 very popup
                 */
                if (!state.session) {
                    window.location = "login.html";
                }
            }

            function associate_behavior_with_buttons() {
                    /* Helper function */
                    function translate(term) {
                        if (term.length > 0) {
                            window.location = browser.zeeguuUrl(term);
                        }
                    }


                $("#fast-mode").toggleClass("enabled", state.fast).click(function () {
                    state.fast = !state.fast;
                    browser.sendMessage("update_state", {
                        fast: state.fast
                    });
                    $(this).toggleClass("enabled", state.fast);
                });
                $("#selection-mode").toggleClass("enabled", state.selectionMode).click(function () {
                    state.selectionMode = !state.selectionMode;
                    browser.sendMessage("update_state", {
                        selectionMode: state.selectionMode
                    });
                    $(this).toggleClass("enabled", state.selectionMode);
                });
                $("#highlighting-mode").toggleClass("enabled", state.highlight).click(function () {
                    state.highlight = !state.highlight;
                    browser.sendMessage("update_state", {
                        highlight: state.highlight
                    });
                    $(this).toggleClass("enabled", state.highlight);
                });

                $("#translate").keypress(function (e) {
                    if (e.which == 13) {  // The return key
                        translate($(this).val());
                    }
                });
                $("#translate-btn").click(function () {
                    translate($("#translate").val());
                });
                $("#options-btn").click(function () {
                    browser.newTab("/gui/html/plugin-preferences.html");
                });
                $("#to-the-gym").click(function () {
                    browser.newTab(API_URL + "recognize");
                });
                $("#to-the-word-list").click(function () {
                    browser.newTab(API_URL + "contributions");
                });
                $("#to-the-help-page").click(function () {
                    browser.newTab("/gui/html/plugin_help.html");
                });
            }
        
        /* Main action of load State */
        set_the_help_for_buttons();
        redirect_to_login_if_needed();
        associate_behavior_with_buttons();
    });
});
