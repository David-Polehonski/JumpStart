/*  @jDialog.js
    Dialog window functionality for the jumpstart framwork.
*/
(function (J) {
    'use strict';
	//	Private module variables.
	var	DialogContainer = new J.Class(),
		_containerInstance,
		_css;

	var WINDOW_LOCK_CLASS = 'dialog-lock';

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
			if (J.Dialog.containerClassName !== null) {
				this.container.className += ' ' + J.Dialog.containerClassName;
			}
		},
		'loadCss': function () {
			var Styles = J.import('Styles');
			var newStyleSheet = document.createElement('link');
			newStyleSheet.rel = "stylesheet";
			newStyleSheet.href = J.get('rootPath') + "/ui-css/dialog.css";

			_css = (document.head || document.getElementsByTagName('head')[0]).insertBefore(newStyleSheet, document.getElementsByTagName('link')[0]);
			var styleBlock = new Styles();

			styleBlock.addRules("html.dialog-lock", ["height: 100%", "width: 100%", "overflow-y: scroll;"]);

			styleBlock.addRules(".dialog-container", ["display: none"]);

			styleBlock.addRules(".dialog-container.open", [
				"position: fixed",
				"display: block",
				"top: 0",
				"left: 0",
				"width: 100%",
				"height: 100%",
				"z-index: 1000"
			]);

			if (isFlex()) {
				styleBlock.addRules(".dialog-container.open", [
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

				styleBlock.addRules(".dialog-window", [
					""
				]);

				styleBlock.addRules(".dialog-window.inactive", [
					"display: none;"
				]);
			} else {
				styleBlock.addRules(".dialog-container.open", [
					"text-align: center;"
				]);

				styleBlock.addRules(".dialog-window", [
					"display: inline-block;",
					"min-width: 40%;",
					"margin: 1em;",
					"position: relative;",
					"top: 25%;"
				]);

				styleBlock.addRules(".dialog-window.inactive", [
					"display: none;"
				]);
			}


		},
		'createNewDialog': function (inst) {
			var newDialog = null,
				closeButton = null,
				contentNode = null;

			if (inst.config.closeButton !== null) {
				if (typeof inst.config.closeButton === typeof 'string') {
					closeButton = document.createElement('div');
					closeButton.className = "dialog-close-button";
					closeButton.appendChild(document.createTextNode(inst.config.closeButton));
				} else if(isElement(inst.config.closeButton)) {
					closeButton = inst.config.closeButton.cloneNode(true);
				}

				if (closeButton !== null) {
					closeButton = inst.closeButton = closeButton;
				}
			}

			if (!!inst.config.contentNode) {
				if (inst.config.preserveContent) {
					contentNode = inst.config.contentNode.cloneNode(true);
				} else {
					contentNode = inst.config.contentNode;
				}

				inst.setContent(contentNode);
			} else {
				inst.setContent( document.createElement('div') );
			}

			this.container.appendChild( inst.content );

			if (inst.config.animationStyle !== null) {
				if (inst.config.animationLength === null) {
					throw('Mis-configured jDialog. animationStyle specified without animationLength.');
				}
				inst.content.className += ' ' + inst.config.animationStyle;
				inst.content.className += ' ' + inst.config.animationLength;
				inst.animated = true;
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
				cssClass = WINDOW_LOCK_CLASS;

			if (htmlElement.className.indexOf(WINDOW_LOCK_CLASS) === -1) {

				bodyElement.setAttribute('style',"height: 100%; "+
					"width: 100%; "+
					"overflow: visible; "+
					"position: fixed; "+
					"top:" + -window.pageYOffset + 'px');

				htmlElement.className += (" " + WINDOW_LOCK_CLASS);
			}
		},
		'unlockScreen': function () {
			var htmlElement = document.getElementsByTagName('html')[0];
			var bodyElement = document.getElementsByTagName('body')[0];

			var top = parseInt(bodyElement.style.top.replace(/(-|px)/, ''));

			var update = function () {
				if (htmlElement.className.indexOf(WINDOW_LOCK_CLASS) !== -1) {
					bodyElement.setAttribute('style','');
					htmlElement.className = htmlElement.className.replace(WINDOW_LOCK_CLASS,'');
					window.scroll( 0, top );
				}
			};

			if (!!window.requestAnimationFrame) {
				window.requestAnimationFrame( update );
			} else {
				update();
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
				setTimeout(this.animate.bind(this), 50, next);
			}
		},
		'close': function (then) {
			this.animate(this.closeContainer.bind(this));
		},
		'closeContainer': function closeContainer() {
			if (this.container.className.indexOf('open') != -1){
				this.container.className = this.container.className.replace(/\s?open/, '');
			}
		},
		'update': function (e) {
			// Update ths display if all dialogues are closed.
			var i = 0;
			switch (e.type){
				case 'dialogOpened':
					this.lockScreen();
					this.open();

					for (i; i < this.dialogues.length; i += 1) {
						if (e.detail != this.dialogues[i]) {
							this.dialogues[i].hideWindow();
						}
					}

					break;
				case 'dialogClosed':
				case 'dialogDestroyed':
					for (i; i < this.dialogues.length; i += 1) {
						if (this.dialogues[i].state === J.Dialog.OPEN) {
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
		J.require( 'objectFunctions.js' );
		J.require( 'jStyles.js' );

		J.Dialog = new J.Class( 'Dialog' );

		J.Dialog.OPEN = 0;
		J.Dialog.CLOSED = 1;

		J.Dialog.FADE_IN = 'fade-in';
		J.Dialog.SLIDE_UP = 'slide-up';

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
		J.Dialog.containerClassName = 'default';

		//	Properties.
		J.Dialog.prototype.dialog = null; // Root HTML Element for the dialog content.
		J.Dialog.prototype.state = J.Dialog.CLOSED;
		J.Dialog.prototype.animated = false;

		J.Dialog.prototype.defaultConfig = {
		 	'preserveContent': true,
			'dialogContainerClass': 'default',
			'dialogRootElement': 'div',
			'dialogRootClass': '',
			'contentNode': null,
			'animationStyle': J.Dialog.SLIDE_UP,
			'animationLength': J.Dialog.ONE_MS
		};

		J.Dialog.prototype.init = function (configObj) {
			this.config = J.object(configObj || {}).mergeWith(this.defaultConfig);
			this.container = getContainer();

			this.container.createNewDialog(this);

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
			if(this.state === J.Dialog.OPEN){ return; }
			if (!!replaceContent){
				this.setContent(replaceContent);
			}

			if (this.content.className.indexOf('inactive') !== -1) {
				this.content.className = this.content.className.replace(' inactive','');
				this.state = J.Dialog.OPEN;
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
			var next = this.hideWindow.bind(this);

			if (this.animated && this.state === J.Dialog.OPEN) {
				this.animate(next);
			}else if (this.state === J.Dialog.OPEN){
				next();
			}
		};

		J.Dialog.prototype.hideWindow = function hideWindow() {
			if (this.content.className.indexOf('inactive') === -1) {
				this.content.className += ' inactive';
				this.state = J.Dialog.CLOSED;
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

		J.Dialog.prototype.setContent = function(newContentNode) {
			var oldContentContainer = document.createDocumentFragment();

			if (!this.content) {
				this.content = document.createElement(this.config.dialogRootElement);
				this.content.className = 'dialog-window inactive ' + this.config.dialogRootClass;
			}

			while (this.content.children.length > 0) {
				oldContentContainer.appendChild(this.content.children[0]); // Push old content into a fragment
			}
			//	Insert new node.
			if (!!this.closeButton) {
				var btn = this.content.appendChild(this.closeButton.cloneNode(true));
				btn.addEventListener('click', this.hide.bind(this), false);
			}

			this.content.appendChild(newContentNode);
		};

    }
}(window.J || {}));
