
$(function() {

    $("#translate").focus();  // This doesn't do anything due to a bug in Chrome.
    // Instead the 'tabindex' attribute is used to achieve the same effect.


    var originalHelp = $("#help").text();
    var toolbar_actions = ["#fast-mode", ".sep", "#selection-mode", "#highlighting-mode",
// //        "#to-the-gym",
//        "#to-the-word-list",
//        "#options-btn",
//        "#to-the-help-page",
        "#unwhitelist"
//        , "#translate-btn", "#translate"
    ];
    disable_toolbar_actions();

    function setHelp(selector, helpText) {
        $(selector).on("mouseover focus", function () {
            $("#help").text(helpText);
        }).on("mouseout blur", function () {
            $("#help").text(originalHelp);
        });
    }

    function set_the_help_for_buttons() {
        setHelp("#fast-mode", "Translate by double-clicking");
        setHelp("#selection-mode", "Disable page links for easier selection");
        setHelp("#highlighting-mode", "Highlight in page all the learned words");
        setHelp("#to-the-gym", "Practice at the Language Gym");
        setHelp("#to-the-word-list", "To your words list");
        setHelp("#options-btn", "Zeeguu options");
        setHelp("#to-the-help-page", "Learn more about Zeeguu");
        browser.sendMessage("get_current_url", {}, function(url) {
            setHelp("#page-not-yet-whitelisted", "Activate the extension for " + get_domain_from_url(url));
        });

        browser.sendMessage("get_current_url", {}, function(url) {
            setHelp("#unwhitelist", "Activate the extension for " + get_domain_from_url(url));
        });


    }

    function disable_toolbar_actions() {
        toolbar_actions.map(function (button_id) {
            $(button_id).hide();
        });
        $("#page-not-yet-whitelisted").show();
    }

    function enable_toolbar_actions() {
        toolbar_actions.map(function (button_id) {
            $(button_id).show();
        });
        $("#page-not-yet-whitelisted").hide();
    }


    loadState(function () {
        $("#page-not-yet-whitelisted").click(function () {
            browser.sendMessage("whitelist_current_url", {}, null);
            enable_toolbar_actions();
            browser.sendMessage("enable_icon");
        });

        $("#unwhitelist").click(function () {
            browser.sendMessage("unwhitelist_current_url", {}, null);
            disable_toolbar_actions();
            browser.sendMessage("disable_icon");
        });


        function associate_behavior_with_buttons() {
            /* Helper function */
            function translate(term) {
                if (term.length > 0) {
                    window.location = browser.zeeguuEncodeUrl(term);
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

        /*
         if the popup is called by a user who is not logged in,
         we forward to the login.html which will be loaded in this
         very popup
         */
        if (!state.session) {
            window.location = "login.html";
        } else {


            set_the_help_for_buttons();
            associate_behavior_with_buttons();
            browser.sendMessage("get_current_url", function (url) {
                if (!is_domain_allowed(url, state.whitelisted_domains)) {
                    disable_toolbar_actions();
                } else {
                    enable_toolbar_actions();
                    $("#page-not-yet-whitelisted").hide();
                }
            });
        }
    });
});
