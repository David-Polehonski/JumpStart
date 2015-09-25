/*  @jDialog.js
    Dialog window functionality for the jumpstart framwork.
*/
(function (J) {
    'use strict';

    var _defaults = { }, bg, css;

    function isFlex () {
        var test = document.createElement('div');
        test.style = "display: flex";

        return test.style.display === "flex";
    }

    function initBg () {
        bg = document.createElement('div');
        bg.className = "dialog-container";
        bg = document.body.appendChild(bg);
    }

    function initCss () {
        css = document.querySelector('link[href$="dialog.css"]');
        console.log(J);
        if (!css) {
            /* The stylesheet doesn't exist? */
            J.styles.addRules(".dialog-container", ["display: none"]);

            J.styles.addRules(".dialog-container.open", [
                "position: fixed",
                "display: block",
                "top: 0",
                "left: 0",
                "width: 100%",
                "height: 100%",
                "background-color: rgba(225,225,225,0.5)"
            ]);

            if (isFlex()) {
                J.styles.addRules(".dialog-container.open", [
                    "display: -webkit-box;",
                    "display: -moz-box;",
                    "display: -ms-flexbox;",
                    "display: -webkit-flex;",
                    "display: flex;",
                    "-webkit-flex-flow: column no-wrap;",
                	"-moz-flex-flow: column no-wrap;",
                	"-ms-flex-flow: column no-wrap;",
                	"flex-flow: column no-wrap;",
                    "align-content: center;",
                    "align-items: center;"
                ]);

                J.styles.addRules(".dialog.active", [
                    ""
                ]);
            }


            css = true;
        }
    }


    if (!J.dialog) { // Test for existance of the dialog object.

        J.dialog = new J.Class();

        /*
            @content: The HTML node that contains the content to copy into the dialog window.
            @config: see config options.
        */
        J.dialog.prototype.init = function (content, config) {
            if (!bg) initBg();
            if (!css) initCss();

            config = J.object(config).mergeWith(_defaults);

        };

        J.dialog.prototype.display = function () {}
        J.dialog.prototype.hide = function () {}
        J.dialog.prototype.destroy = function () {}


    }
}(window.J || {}));
