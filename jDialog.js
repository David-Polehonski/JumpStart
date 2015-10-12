/*  @jDialog.js
    Dialog window functionality for the jumpstart framwork.
*/
(function (J) {
    'use strict';
	//	Private module variables.
	var	DialogContainer = new J.Class(),
	    _containerInstance,
		_css;


	// PRIVATE STATIC
    function isFlex () {
        var test = document.createElement('div');
        test.style.display = "flex";

        return test.style.display === "flex";
    }

	function getContainer() {
		if (!_containerInstance){
			_containerInstance = new DialogContainer();
		}
		return _containerInstance;
	}

	//	Private Singleton Object.
	DialogContainer.prototype = {
		'dialogues': [],
		'init': function () {
			this.container = document.createElement('div');
	        this.container.className = "dialog-container";
			document.body.appendChild(this.container);

			this.container.addEventListener('click', this.closeDialogues.bind(this), false); // Use Capture?
			this.container.addEventListener('dialogOpened', this.update.bind(this), false); // Use Capture?
			this.container.addEventListener('dialogClosed', this.update.bind(this), false); // Use Capture?

			this.loadCss();

			return;
		},
		'loadCss': function () {

			var newStyleSheet = document.createElement('link');
			newStyleSheet.rel = "stylesheet";
			newStyleSheet.href = J.var('rootPath') + "ui-css/dialog.css";

			_css = document.head.insertBefore(newStyleSheet, document.getElementsByTagName('link')[0]);

			J.styles.addRules("html.dialog-lock", ["height: 100%"]);

			J.styles.addRules("html.dialog-lock > body", [
				"height: 100%",
				"overflow: hidden"
			]);

			J.styles.addRules(".dialog-container", ["display: none"]);

			J.styles.addRules(".dialog-container.open", [
				"position: fixed",
				"display: block",
				"top: 0",
				"left: 0",
				"width: 100%",
				"height: 100%"
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
					"flex-flow: 'column' 'no-wrap';",
					"justify-content: center;",
					"align-items: center;"
				]);

				J.styles.addRules(".dialog-window", [
					""
				]);

				J.styles.addRules(".dialog-window.inactive", [
					"display: none;"
				]);
			} else {
				J.styles.addRules(".dialog-container.open", [
					"text-align: center;"
				]);

				J.styles.addRules(".dialog-window", [
					"display: inline-block;",
					"min-width: 40%;",
					"margin: 1em;",
					"position: relative;",
					"top: 25%;"
				]);

				J.styles.addRules(".dialog-window.inactive", [
					"display: none;"
				]);
			}


		},
		'createDialog': function (inst) {
			var newDialog = document.createElement(inst.config.dialogRootElement);
			newDialog.className = 'dialog-window inactive ' + inst.config.dialogRootClass;

			if (inst.config.contentNode !== null) {
				newDialog.appendChild(inst.config.contentNode.cloneNode(true));
			}

			if (inst.config.preserveContent === false) {
			 	inst.contentNode.parentNode.removeChild(inst.contentNode);
			}

			newDialog = this.container.appendChild(newDialog);

			newDialog.addEventListener('click', function (e) {
				e = e || window.event;
				e.cancelBubble = true;
				if (e.stopPropagation) e.stopPropagation();
			}, false);
			this.dialogues.push(inst);
			return newDialog;
		},
		'closeDialogues': function () {
			this.dialogues.forEach(function(current, i, a){
				current.hide();
			});
		},
		'lockScreen': function () {
			var htmlElement = document.getElementsByTagName('html')[0],
				cssClass = "dialog-lock";

			if (htmlElement.className.indexOf(cssClass) === -1) {
				htmlElement.className += (" " + cssClass);
			}
		},
		'unlockScreen': function () {
			var htmlElement = document.getElementsByTagName('html')[0],
				cssClass = "dialog-lock";

			if (htmlElement.className.indexOf(cssClass) !== -1) {
				htmlElement.className = htmlElement.className.replace(cssClass,'');
			}
		},
		'update': function (e) {
			e = e || window.event;
			// Update ths display if all dialogues are closed.

			switch (e.type){
				case 'dialogOpened':
					this.lockScreen();

					if (this.container.className.indexOf('open') === -1) {
						this.container.className += ' open';
					}
					break;
				case 'dialogClosed':
				case 'dialogDestroyed':
					for (var i = 0; i < this.dialogues.length; i += 1) {

						if (this.dialogues[i].state === 'open') {
							return;
						}
					}

					if (this.container.className.indexOf('open') != -1) {
						this.container.className =  this.container.className.replace('open');
					}
					this.unlockScreen();
					break;
			}
		}
	};

    if (!J.Dialog) { // Test for existance of the dialog object.

        J.Dialog = new J.Class();
		//	Properties.
		J.Dialog.prototype.dialog = null; // Root HTML Element for the dialog content.
		J.Dialog.prototype.state = null;

		J.Dialog.prototype.defaultConfig = {
		 	'preserveContent': true,
			'dialogRootElement': 'div',
			'dialogRootClass': '',
			'contentNode': null
		};

		J.Dialog.prototype.init = function (configObj) {
			configObj = configObj || {};
            this.container = getContainer();
			this.config = J.object(configObj).mergeWith(this.defaultConfig);

			return this;
        };

        J.Dialog.prototype.display = function () {
			if (!this.dialog) {
				this.dialog = this.container.createDialog(this);
			}
			if (this.dialog.classList.contains('inactive')) {
				this.dialog.classList.remove('inactive');
				this.state = 'open';
			}

			var event = new CustomEvent('dialogOpened', { 'detail': this, 'bubbles': true, 'cancelable': true});
			this.dialog.dispatchEvent(event);
		};

        J.Dialog.prototype.hide = function () {
			if (!this.dialog.classList.contains('inactive')) {
				this.dialog.classList.add('inactive');
				this.state = 'closed';
			}

			var event = new CustomEvent('dialogClosed', { 'detail': this, 'bubbles': true, 'cancelable': true});
			this.dialog.dispatchEvent(event);
		};

        J.Dialog.prototype.destroy = function () {
			this.dialog.parentNode.removeChild(this.dialog);
			delete this.dialog;
			this.state = null;

			var event = new CustomEvent('dialogDestroyed', { 'detail': this, 'bubbles': true, 'cancelable': true});
			this.dialog.dispatchEvent(event);
		};

    }
}(window.J || {}));
