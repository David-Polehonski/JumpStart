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
        try {test.style.display = "flex";} catch(e) { return false; }

        return test.style.display === "flex";
    }

	function isElement (e) {
		return typeof HTMLElement === "object" ?
			e instanceof HTMLElement : //DOM2
    		e && typeof e === "object" && e !== null && e.nodeType === 1 && typeof e.nodeName==="string";
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

			this.container = document.body.appendChild(this.container);

			this.container.addEventListener('click', this.closeDialogues.bind(this), false); // Use Capture?
			this.container.addEventListener('dialogOpened', this.update.bind(this), false); // Use Capture?
			this.container.addEventListener('dialogClosed', this.update.bind(this), false); // Use Capture?

			if ('createEventObject' in document && !('createEvent' in document)) {
				// No custom events.. must be IE8.
				this.container.addEventListener('propertychange', function (e) {
					if (e.propertyName === 'eventName') {
						var fakeEvent = J.object({}).mergeWith(e);
						fakeEvent.type = e.srcElement.getAttribute('eventName');
						this.update(fakeEvent);
					}
				}.bind(this), false);

				this.container.setAttribute('eventName','init');
				this.ie8Mode = true; // SET IE8 MODE.
			}

			this.loadCss();

			this.configure();

			return;
		},
		'configure': function () {
			if (J.Dialog.containerAnimationStyle !== null) {
				this.container.className += ' ' + J.Dialog.containerAnimationStyle;
			}
			if (J.Dialog.containerAnimationLength !== null) {
				this.container.className += ' ' + J.Dialog.containerAnimationLength;
			}
		},
		'loadCss': function () {

			var newStyleSheet = document.createElement('link');
			newStyleSheet.rel = "stylesheet";
			newStyleSheet.href = J.value('rootPath') + "ui-css/dialog.css";

			_css = (document.head || document.getElementsByTagName('head')[0]).insertBefore(newStyleSheet, document.getElementsByTagName('link')[0]);

			J.styles.addRules("html.dialog-lock", ["height: 100%", "overflow-y: hidden"]);

			J.styles.addRules("html.dialog-lock > body", [
				"height: 100%",
				"overflow: visible"
			]);

			J.styles.addRules(".dialog-container", ["display: none"]);

			J.styles.addRules(".dialog-container.open", [
				"position: fixed",
				"display: block",
				"top: 0",
				"left: 0",
				"width: 100%",
				"height: 100%",
				"z-index: 1000"
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
		'createNewDialog': function (inst) {
			var newDialog = null,
				closeButton = null;

			if (inst.config.contentNode !== null) {
				// Dialog window is being passed in.
				newDialog = inst.config.contentNode.cloneNode(true);
				if (inst.config.preserveContent === false) {
				 	inst.contentNode.parentNode.removeChild(inst.contentNode);
				}
			} else {
				newDialog = document.createElement(inst.config.dialogRootElement);
			}

			newDialog.className = 'dialog-window inactive ' + inst.config.dialogRootClass;

			if (inst.config.animationStyle !== null) {
				if (inst.config.animationLength === null) {
					throw('Mis-configured jDialog. animationStyle specified without animationLength.');
				}
				newDialog.className += ' ' + inst.config.animationStyle;
				newDialog.className += ' ' + inst.config.animationLength;
				inst.animated = true;
			}

			if (inst.config.closeButton !== null) {
				if (typeof inst.config.closeButton === typeof 'string') {
					closeButton = document.createElement('div');
					closeButton.className = "dialog-close-button";
					closeButton.appendChild(document.createTextNode(inst.config.closeButton));
				} else if(isElement(inst.config.closeButton)) {
					closeButton = inst.config.closeButton.cloneNode(true);
				}

				if (closeButton !== null) {
					closeButton = newDialog.appendChild(closeButton);
					closeButton.addEventListener('click', inst.hide.bind(inst), false);
				}
			}

			newDialog = this.container.appendChild(newDialog);

			newDialog.addEventListener('click', function (e) {
				e = e || window.event;
				e.cancelBubble = true;
				if (e.stopPropagation) e.stopPropagation();
			}, false);
			this.dialogues.push(inst);

			if (this.ie8Mode) {
				inst.config.ie8Mode = true;
			}

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
		'animate': function (next) {
			if (this.container.className.indexOf('animate') === -1) {
				this.container.className += ' animate';
			} else {
				this.container.className =  this.container.className.replace(' animate', '');
			}
			if(typeof next === 'function'){
				setTimeout(next, J.Dialog.DURATIONS[J.Dialog.containerAnimationLength]);
			}
		},
		'open': function (then) {
			var next = then || null;
			if (this.container.className.indexOf('open') === -1) {
				this.container.className += ' open';
			}
			setTimeout(this.animate.bind(this), 50, next);
		},
		'close': function (then) {
			function closeContainer() {
				if (this.container.className.indexOf(' open') != -1) {
					this.container.className =  this.container.className.replace(' open', '');
				}
			}
			this.animate(closeContainer.bind(this));
		},
		'update': function (e) {
			// Update ths display if all dialogues are closed.

			switch (e.type){
				case 'dialogOpened':
					this.lockScreen();
					this.open();

					break;
				case 'dialogClosed':
				case 'dialogDestroyed':
					for (var i = 0; i < this.dialogues.length; i += 1) {
						if (this.dialogues[i].state === 'open') {
							return;
						}
					}

					this.close();
					this.unlockScreen();
					break;
			}
		}
	};

    if (!J.Dialog) { // Test for existance of the dialog object.

        J.Dialog = new J.Class();

		J.Dialog.FADE_IN = 'fade-in';
		J.Dialog.SLIDE_UP= 'slide-up';

		J.Dialog.ONE_MS = 'duration-1';
		J.Dialog.TWO_MS = 'duration-2';
		J.Dialog.THREE_MS = 'duration-3';
		J.Dialog.FOUR_MS = 'duration-4';

		J.Dialog.DURATIONS = {
			'duration-1': 100 ,
			'duration-2': 250 ,
			'duration-3': 500 ,
			'duration-4': 750
		};

		J.Dialog.containerAnimationStyle = J.Dialog.FADE_IN;
		J.Dialog.containerAnimationLength = J.Dialog.ONE_MS;

		//	Properties.
		J.Dialog.prototype.dialog = null; // Root HTML Element for the dialog content.
		J.Dialog.prototype.state = null;
		J.Dialog.prototype.animated = false;

		J.Dialog.prototype.defaultConfig = {
		 	'preserveContent': true,
			'dialogRootElement': 'div',
			'dialogRootClass': '',
			'contentNode': null,
			'animationStyle': J.Dialog.SLIDE_UP,
			'animationLength': J.Dialog.ONE_MS
		};

		J.Dialog.prototype.init = function (configObj) {
			configObj = configObj || {};
            this.container = getContainer();
			this.config = J.object(configObj).mergeWith(this.defaultConfig);

			return this;
        };
		J.Dialog.prototype.animate = function (next) {
			if (this.dialog.className.indexOf('animate') === -1) {
				this.dialog.className += ' animate';
			} else {
				this.dialog.className =  this.dialog.className.replace(' animate', '');
			}
			if (typeof next === 'function'){
				setTimeout(next, J.Dialog.DURATIONS[this.config.animationLength]);
			}
		};
        J.Dialog.prototype.display = function () {
			if (!this.dialog) {
				this.dialog = this.container.createNewDialog(this);
			}

			if (this.dialog.className.indexOf('inactive') !== -1) {
				this.dialog.className = this.dialog.className.replace(' inactive','');
				this.state = 'open';
				if (this.animated) {
					setTimeout(this.animate.bind(this),50);
				}
			}

			if ('ie8Mode' in this.config) {
				this.container.container.setAttribute('eventName','dialogOpened');
			} else {
				var event = new CustomEvent('dialogOpened', { 'detail': this, 'bubbles': true, 'cancelable': true});
				this.dialog.dispatchEvent(event);
			}
		};

        J.Dialog.prototype.hide = function () {
			function hideWindow(){
				if (this.dialog.className.indexOf('inactive') === -1) {
					this.dialog.className += ' inactive';
					this.state = 'closed';
				}
				if ('ie8Mode' in this.config) {
					this.container.container.setAttribute('eventName','dialogClosed');
				} else {
					var event = new CustomEvent('dialogClosed', { 'detail': this, 'bubbles': true, 'cancelable': true});
					this.dialog.dispatchEvent(event);
				}
			}
			var next = hideWindow.bind(this);

			if (this.animated && this.state === 'open') {
				this.animate(next);
			}else if (this.state === 'open'){
				next();
			}
		};

        J.Dialog.prototype.destroy = function () {
			this.dialog.parentNode.removeChild(this.dialog);
			delete this.dialog;
			this.state = null;
			if ('ie8Mode' in this.config) {
				this.container.container.setAttribute('eventName','dialogDestroyed');
			} else {
				var event = new CustomEvent('dialogDestroyed', { 'detail': this, 'bubbles': true, 'cancelable': true});
				this.dialog.dispatchEvent(event);
			}
		};

    }
}(window.J || {}));
