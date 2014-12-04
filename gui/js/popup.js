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

    function translate(term) {
        if (term.length > 0) {
            window.location = browser.zeeguuUrl(term);
        }
    }

    setHelp("#fast-mode", "Translate by double-clicking");
    setHelp("#selection-mode", "Disable page links for easier selection");
    setHelp("#to-the-gym", "Practice at the Language Gym");
    setHelp("#to-the-word-list", "To your words list");
    setHelp("#options-btn", "Edit plugin options");
    setHelp("#to-the-help-page", "Email us a question about Zeeguu");

    loadState(function() {

        /*
         if the popup is called by a user who is not logged in,
         we forward to the login.html which will be loaded in this
         very popup
         */
        if (!state.session) {
            window.location = "login.html";
        }

        $("#fast-mode").toggleClass("enabled", state.fast).click(function() {
            state.fast = !state.fast;
            browser.sendMessage("update_state", {
                fast: state.fast
            });
            $(this).toggleClass("enabled", state.fast);
        });


        $("#selection-mode").toggleClass("enabled", state.selectionMode).click(function() {
            state.selectionMode = !state.selectionMode;
            browser.sendMessage("update_state", {
                selectionMode: state.selectionMode
            });
            $(this).toggleClass("enabled", state.selectionMode);
        });

        $("#translate").keypress(function (e) {
          if (e.which == 13) {  // The return key
            translate($(this).val());
          }
        });

        $("#translate-btn").click(function() {
            translate($("#translate").val());
        });

        $("#options-btn").click(function() {
            browser.newTab("/gui/html/options.html");
        });

        $("#to-the-gym").click(function() {
            browser.newTab(API_URL+"recognize");
        });

        $("#to-the-word-list").click(function() {
            browser.newTab(API_URL+"contributions");
        });

        $("#to-the-help-page").click(function() {
//            var mailto_link = 'mailto:mircea.lungu@gmail.com?subject=Zeeguu%20Question';
//            var win = window.open(mailto_link, 'emailWindow');
//            browser.newTab(API_URL+"plugin_help");
            browser.newTab("/gui/html/plugin_help.html");

        });
    });
});
