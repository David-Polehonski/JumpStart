/*  @jDialog.js
    Dialog window functionality for the jumpstart framwork.
*/
(function (J) {
    'use strict';

    var _defaults = {
	 	'preserveContent':false,
		'dialogRootElement':'div',
		'dialogRootClass':''
	}, bg, css;

	// PRIVATE STATIC
    function isFlex () {
        var test = document.createElement('div');
        test.style.display = "flex";

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

	// PRIVATE INSTANCE
	function createDialog (inst) {
		inst.dialog = document.createElement(inst.config.dialogRootElement);
		inst.dialog.className = 'dialog-window inactive ' + inst.config.dialogRootClass;
		inst.content = inst.dialog.appendChild(inst.content);
		inst.dialog = bg.appendChild(inst.dialog);
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

            this.config = J.object(config).mergeWith(_defaults);
			this.content = content.cloneNode(true); // Create Deep Copy of the node.
			if (!this.config.preserveContent) {
				content.parentNode.removeChild(content);
			}

			return this;
        };

        J.dialog.prototype.display = function () {
			if (!this.dialog) createDialog.bind(this)();

			if (this.dialog.classList.contains('inactive')) {
				this.dialog.classList.remove('inactive');
			}
		};

        J.dialog.prototype.hide = function () {
			if (!this.dialog.classList.contains('inactive')) {
				this.dialog.classList.add('inactive');
			}
		};

        J.dialog.prototype.destroy = function () {
			this.dialog.parentNode.removeChild(this.dialog);
			delete this.dialog;
		};

    }
}(window.J || {}));
