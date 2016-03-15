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

    // function for stopping background scroll on mobile devices, called at line 211 and 221.
    function stopScroll(evt) {
		evt.preventDefault();
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

			J.styles.addRules("html.dialog-lock", ["height: 100%", "width: 100%"]);

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

			inst.setContent(inst.config.contentNode);

			if (inst.config.animationStyle !== null) {
				if (inst.config.animationLength === null) {
					throw('Mis-configured jDialog. animationStyle specified without animationLength.');
				}
				inst.content.className += ' ' + inst.config.animationStyle;
				inst.content.className += ' ' + inst.config.animationLength;
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
					closeButton = inst.content.appendChild(closeButton);
					closeButton.addEventListener('click', inst.hide.bind(inst), false);
				}
			}

			inst.content.addEventListener('click', function (e) {
				e = e || window.event;
				e.cancelBubble = true;
				if (e.stopPropagation) e.stopPropagation();
			}, false);

			this.dialogues.push(inst);

			if (this.ie8Mode) {
				inst.config.ie8Mode = true;
			}

			return inst.content;
		},
		'closeDialogues': function () {
			this.dialogues.forEach(function(current, i, a){
				current.hide();
			});
		},
		'lockScreen': function () {
			var htmlElement = document.getElementsByTagName('html')[0],
			 	bodyElement = document.getElementsByTagName('body')[0],
				cssClass = "dialog-lock";

			if (htmlElement.className.indexOf(cssClass) === -1) {

				bodyElement.setAttribute('style',"height: 100%; "+
					"width: 100%; "+
					"overflow: auto; "+
					"position: fixed "+
					-window.pageYOffset + 'px');

				htmlElement.className += (" " + cssClass);
			}
		},
		'unlockScreen': function () {
			var htmlElement = document.getElementsByTagName('html')[0],
				bodyElement = document.getElementsByTagName('body')[0],
				cssClass = "dialog-lock";

            //htmlElement.removeEventListener("touchmove", stopScroll, false);

			if (htmlElement.className.indexOf(cssClass) !== -1) {
				bodyElement.setAttribute('style','');
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
				if (this.container.className.indexOf(' open') !== -1) {
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
			this.content = this.container.createNewDialog(this);

			return this;
        };

		J.Dialog.prototype.animate = function (next) {
			if (this.content.className.indexOf('animate') === -1) {
				this.content.className += ' animate';
			} else {
				this.content.className =  this.content.className.replace(' animate', '');
			}
			if (typeof next === 'function'){
				setTimeout(next, J.Dialog.DURATIONS[this.config.animationLength]);
			}
		};

        J.Dialog.prototype.display = function (replaceContent) {

			if (!!replaceContent){
				this.setContent(replaceContent);
			}

			if (this.content.className.indexOf('inactive') !== -1) {
				this.content.className = this.content.className.replace(' inactive','');
				this.state = 'open';
				if (this.animated) {
					setTimeout(this.animate.bind(this),50);
				}
			}

			if ('ie8Mode' in this.config) {
				this.container.container.setAttribute('eventName','dialogOpened');
			} else {
				var event = new CustomEvent('dialogOpened', { 'detail': this, 'bubbles': true, 'cancelable': true});
				this.content.dispatchEvent(event);
			}
		};

        J.Dialog.prototype.hide = function () {
			function hideWindow(){
				if (this.content.className.indexOf('inactive') === -1) {
					this.content.className += ' inactive';
					this.state = 'closed';
				}
				if ('ie8Mode' in this.config) {
					this.container.container.setAttribute('eventName','dialogClosed');
				} else {
					var _event = new CustomEvent('dialogClosed', {
						'detail': this,
						'bubbles': true,
						'cancelable': true
					});
					this.content.dispatchEvent(_event);
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
			if ('ie8Mode' in this.config) {
				this.container.container.setAttribute('eventName','dialogDestroyed');
			} else {
				var event = new CustomEvent('dialogDestroyed', { 'detail': this, 'bubbles': true, 'cancelable': true});
				this.content.dispatchEvent(event);
			}
			this.content.parentNode.removeChild(this.content);
			delete this.content;
			this.state = null;
		};

		J.Dialog.prototype.setContent = function(newContentNode){
			var newContent = document.createDocumentFragment();
			var oldContent = this.content || null;

			//	Set the new dialog root element:
			this.content = newContent.appendChild(document.createElement(this.config.dialogRootElement));

			//	Set the className to dialog + config class root.
			this.content.className = 'dialog-window inactive ' + this.config.dialogRootClass;

			//	Insert new node.
			this.content.appendChild(newContentNode);
			if(oldContent !== null) {
				this.container.container.replaceChild(this.content, oldContent);
			} else {
				this.container.container.appendChild(this.content);
			}
		};

    }
}(window.J || {}));
