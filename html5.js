// JavaScript Document - HTML 5 BODGE IT! (JavaJumpBox)
(function(J){

	// Poly fill HTML5 Elements
    var _newElements_inline = [
        'menu','menuitem','details','summary','data','main',
        'track','embed','source','keygen','bdi','math','svg',
        'progress','ruby','rp','rt','wbr','mark','meter','time', 'picture'];

    var _newElements_inline_block = [
        'datalist'
    ];

    var _newElements_block = [
        'section','nav','article','aside','header','hgroup','footer',
        'figure','figcaption','canvas','audio','output','video'
    ];

    var _newElements_nonvisible = [
        'template'
    ];

    for(var i =0; i < _newElements_inline.length; i++){
       document.createElement(_newElements_inline[i]);
    }

    for(var c =0; c < _newElements_inline_block.length; c++){
       document.createElement(_newElements_inline_block[c]);
    }

    for(var b =0; b < _newElements_block.length; b++){
       document.createElement(_newElements_block[b]);
    }

    for(var v =0; v < _newElements_nonvisible.length; v++){
       document.createElement(_newElements_nonvisible[v]);
    }

    // Poly fill: 'Array.indexOf'
    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function (searchElement, fromIndex) {
            if ( this === undefined || this === null ) {
                throw new TypeError( '"this" is null or not defined' );
            }

            var length = this.length >>> 0; // Hack to convert object.length to a UInt32

            fromIndex = +fromIndex || 0;

            if (Math.abs(fromIndex) === Infinity) {
                fromIndex = 0;
            }

            if (fromIndex < 0) {
                fromIndex += length;
                if (fromIndex < 0) {
                fromIndex = 0;
                }
            }

            for (;fromIndex < length; fromIndex++) {
                if (this[fromIndex] === searchElement) {
                    return fromIndex;
                }
            }
            return -1;
        };
    }

    // Poly fill: 'Function.bind'
    if (!Function.prototype.bind) {
        Function.prototype.bind = function (oThis) {
        if (typeof this !== "function") {
            // closest thing possible to the ECMAScript 5 internal IsCallable function
            throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
        }

        var aArgs = Array.prototype.slice.call(arguments, 1),
            fToBind = this,
            fNOP = function () {},
            fBound = function () {
            return fToBind.apply(
				this instanceof fNOP && oThis ? this : oThis,
                aArgs.concat(Array.prototype.slice.call(arguments)));
        };

        fNOP.prototype = this.prototype;
        fBound.prototype = new fNOP();

        return fBound;
        };
    }

	//	Polyfil addEventListener for IE8.

	if (!Event.prototype.preventDefault) {
		Event.prototype.preventDefault = function() {
			this.returnValue=false;
		};
	}
	if (!Event.prototype.stopPropagation) {
		Event.prototype.stopPropagation=function() {
			this.cancelBubble=true;
		};
	}

	if (!Element.prototype.addEventListener) {
		(function () {
			var eventListeners=[];

			var addEventListener=function(type,listener /*, useCapture (will be ignored) */) {
				var self=this;
				var wrapper=function(e) {
					e.target=e.srcElement;
					e.currentTarget=self;
					if (listener.handleEvent) {
						listener.handleEvent(e);
					} else {
						listener.call(self,e);
					}
				};
				if (type=="DOMContentLoaded") {
					var wrapper2=function(e) {
						if (document.readyState=="complete") {
							wrapper(e);
						}
					};
					document.attachEvent("onreadystatechange",wrapper2);
					eventListeners.push({object:this,type:type,listener:listener,wrapper:wrapper2});

					if (document.readyState=="complete") {
						var e=new Event();
						e.srcElement=window;
						wrapper2(e);
					}
				} else {
					this.attachEvent("on"+type,wrapper);
					eventListeners.push({object:this,type:type,listener:listener,wrapper:wrapper});
				}
			};
			var removeEventListener=function(type,listener /*, useCapture (will be ignored) */) {
				var counter=0;
				while (counter<eventListeners.length) {
					var eventListener=eventListeners[counter];
					if (eventListener.object==this && eventListener.type==type && eventListener.listener==listener) {
						if (type=="DOMContentLoaded") {
							this.detachEvent("onreadystatechange",eventListener.wrapper);
						} else {
							this.detachEvent("on"+type,eventListener.wrapper);
						}
						eventListeners.splice(counter, 1);
						break;
					}
					++counter;
				}
			};
			Element.prototype.addEventListener=addEventListener;
			Element.prototype.removeEventListener=removeEventListener;
			if (HTMLDocument) {
				HTMLDocument.prototype.addEventListener=addEventListener;
				HTMLDocument.prototype.removeEventListener=removeEventListener;
			}
			if (Window) {
				Window.prototype.addEventListener=addEventListener;
				Window.prototype.removeEventListener=removeEventListener;
			}
		})();
	}

	var HTML = new J.Class();

    HTML.prototype.init = function(J) {
        var styles = document.getElementsByTagName('head')[0].appendChild(document.createElement('style')).styleSheet;
        styles.addRule("html.ie *","zoom:1;",0);

        for(var b = 0; b < _newElements_block.length; b++){
            styles.addRule(_newElements_block[b],"display:block;",0);
        }

        for(var c = 0; c < _newElements_block.length; c++){
            styles.addRule(_newElements_inline_block[c],"display:inline-block;",0);
        }

        for(var v = 0; v < _newElements_nonvisible.length; v++){
            styles.addRule(_newElements_nonvisible[v],"display:none;",0);
        }

        /* Datalist fallback - David Polehonski */
        (function (global){
            var datalists_src = document.getElementsByTagName('datalist'), datalists = {};
            var inputs_src = document.getElementsByTagName('input'), inputs = [];

            for(var d = 0; d < datalists_src.length; d++){
                if(datalists_src[d].id){
                    datalists[datalists_src[d].id] = datalists_src[d].cloneNode(true);
                }
                datalists_src[d].parentNode.removeChild(datalists_src[d]);
            }

            for(var i = 0; i < inputs_src.length; i++){
                if(inputs_src[i].hasAttribute('list')){
                    inputs.push(inputs_src[i]);
                }
            }

            var dataList = new J.Class();
            dataList.prototype.init = function(bind){
                var div = document.createElement('div');
                var parent = bind.parentNode;

                this.view = parent.insertBefore(div,bind);
                this.field = this.view.appendChild(bind);

                this.suggestions = [];
                this.render(this.view);
                this.setUpCallBack();
            };

            dataList.prototype.render = function(divObject){
                this.container = divObject;
                this.container.className = "autoSuggest";
                this.field = this.field;
                this.suggestList = this.container.appendChild(document.createElement("ul"));
                this.suggestList.className = "suggestions hidden";

                var styleRules = J.styles.getStyles();

                styleRules.addRules(".autoSuggest",["display:inline",
                                                    "z-index: 1001"]);
                styleRules.addRules(".autoSuggest input",["font-size:12px;"]);

                styleRules.addRules(".suggestions",["position:absolute",
                                                    "background-color:#ffffff",
                                                    "width:" + this.field.clientWidth + "px",
                                                    "height:auto",
                                                    "margin:0px",
                                                    "padding:3px",
                                                    "left:0px",
                                                    "top:" + this.field.clientHeight + "px",
                                                    "box-shadow:1px 1px 1px 0px #333333",
                                                    "z-index: 1002"]);

                styleRules.addRules(".suggestions>li",["padding:0.1em","cursor:pointer","list-style-type:none","text-align:left"]);
                styleRules.addRules(".suggestions>li:hover",["padding:0.1em","background-color:#CCCCCC"]);
                styleRules.addRules(".suggestions>li>span",["text-decoration:underline"]);

                styleRules.addRules(".suggestions.hidden",["display:none"]);
                styleRules.addRules(".suggestions.display",["display:block"]);
                styleRules.addRules(".autoSuggest",["position:relative"]);
            };

            dataList.prototype.update = function(string){
                var x, i = 0, regex = new RegExp(string,"i"), maxLength = 25;

                this.clearList();

                if(string.length >= 3){
                    for(i; i < this.suggestions.length; i++)
                    {
                        x = this.suggestions[i];
                        if(regex.test(x) && this.suggestList.getElementsByTagName('li').length <= maxLength)
                        {
                            this.addElement(x,string);
                        }
                    }

                }
                if(this.suggestList.getElementsByTagName('li').length > 0)
                {
                    this.suggestList.className = "suggestions display";
                }else
                {
                    this.suggestList.className = "suggestions hidden";
                }
            };

            dataList.prototype.resetView = function(){
                this.suggestList.className = "suggestions hidden";
            };

            dataList.prototype.clearList = function(){
                var li = this.suggestList.getElementsByTagName('li'), i=0;
                i = li.length;
                for(i;i > 0;i--)
                {
                    this.suggestList.removeChild(li[i-1]);
                }

            };

            dataList.prototype.addElement = function(value,s){

                var newLi = document.createElement('li');

                value = value.replace(new RegExp(s,'i'),"<span>$&</span>");
                newLi.innerHTML = value;

                var newElement = this.suggestList.appendChild(newLi);
                /*
                ||	Add the event listener to the li here for auto-fill.
                */
                var autosuggest = this;

				function callback(e) {
                    autosuggest.updateField(this);
                }

                if(window.addEventListener) {
                    newElement.addEventListener("click",callback,false);
                }else {
                    newElement.onclick = callback;
                }

            };

            dataList.prototype.loadSuggestions = function(newSuggestions){
                // Takes and array of suggestions
                this.suggestions = newSuggestions;
            };

            dataList.prototype.setUpCallBack = function(){
                var autosuggest = this;
                var callback = function(e) {
                    "use strict";
                    var evt = e || window.event;
                    autosuggest.update(this.value);
                };

                var resetback = function(e) {
                    "use strict";
                    var evt = e || window.event;
                    autosuggest.resetView();
                };

                if(window.addEventListener)
                {
                    this.field.addEventListener("keyup",callback,false);
                    document.body.addEventListener("click",resetback,false);
                }else
                {
                    this.field.onkeyup = callback;
                    document.body.onclick = resetback;
                }
            };
            dataList.prototype.updateField = function(value){
                var fValue = value.textContent || value.innerText;
                this.field.value = fValue;
                this.resetView();
            };

            for(ix = 0; ix < inputs.length; ix++){
                var a = new dataList(inputs[ix]);
                var list, arr = [];

                if(datalists[inputs[ix].getAttribute('list')]){
                    list = datalists[inputs[ix].getAttribute('list')].getElementsByTagName('option');
                    for(var c = 0; c < list.length; c++){
                        arr.push(list[c].value);
                    }
                    a.loadSuggestions(arr);
                }
            }

        })(this);

        /* Placeholder.js - http://jamesallardice.github.io/Placeholders.js/ for HTML5 placeholders */
        (function (global) {
			"use strict";

            // Cross-browser DOM event binding
            function addEventListener(elem, event, fn) {
                if (elem.addEventListener) {
                    return elem.addEventListener(event, fn, false);
                }
                if (elem.attachEvent) {
                    return elem.attachEvent("on" + event, fn);
                }
            }

            // Check whether an item is in an array (we don't use Array.prototype.indexOf so we don't clobber any existing polyfills - this is a really simple alternative)
            function inArray(arr, item) {
                var i, len;
                for (i = 0, len = arr.length; i < len; i++) {
                    if (arr[i] === item) {
                        return true;
                    }
                }
                return false;
            }

            // Move the caret to the index position specified. Assumes that the element has focus
            function moveCaret(elem, index) {
                var range;
                if (elem.createTextRange) {
                    range = elem.createTextRange();
                    range.move("character", index);
                    range.select();
                } else if (elem.selectionStart) {
                    elem.focus();
                    elem.setSelectionRange(index, index);
                }
            }

            // Attempt to change the type property of an input element
            function changeType(elem, type) {
                try {
                    elem.type = type;
                    return true;
                } catch (e) {
                    // You can't change input type in IE8 and below
                    return false;
                }
            }

            // Expose public methods
            global.Placeholders = {
                Utils: {
                    addEventListener: addEventListener,
                    inArray: inArray,
                    moveCaret: moveCaret,
                    changeType: changeType
                }
            };
        }(this));

        (function (global) {

            "use strict";

            var validTypes = [
                    "text",
                    "search",
                    "url",
                    "tel",
                    "email",
                    "password",
                    "number",
                    "textarea"
                ],

                // The list of keycodes that are not allowed when the polyfill is configured to hide-on-input
                badKeys = [

                    // The following keys all cause the caret to jump to the end of the input value
                    27, // Escape
                    33, // Page up
                    34, // Page down
                    35, // End
                    36, // Home

                    // Arrow keys allow you to move the caret manually, which should be prevented when the placeholder is visible
                    37, // Left
                    38, // Up
                    39, // Right
                    40, // Down

                    // The following keys allow you to modify the placeholder text by removing characters, which should be prevented when the placeholder is visible
                    8, // Backspace
                    46 // Delete
                ],

                // Styling variables
                placeholderStyleColor = "#ccc",
                placeholderClassName = "placeholdersjs",
                classNameRegExp = new RegExp("(?:^|\\s)" + placeholderClassName + "(?!\\S)"),

                // These will hold references to all elements that can be affected. NodeList objects are live, so we only need to get those references once
                inputs, textareas,

                // The various data-* attributes used by the polyfill
                ATTR_CURRENT_VAL = "data-placeholder-value",
                ATTR_ACTIVE = "data-placeholder-active",
                ATTR_INPUT_TYPE = "data-placeholder-type",
                ATTR_FORM_HANDLED = "data-placeholder-submit",
                ATTR_EVENTS_BOUND = "data-placeholder-bound",
                ATTR_OPTION_FOCUS = "data-placeholder-focus",
                ATTR_OPTION_LIVE = "data-placeholder-live",
                ATTR_MAXLENGTH = "data-placeholder-maxlength",

                // Various other variables used throughout the rest of the script
                test = document.createElement("input"),
                head = document.getElementsByTagName("head")[0],
                root = document.documentElement,
                Placeholders = global.Placeholders,
                Utils = Placeholders.Utils,
                hideOnInput, liveUpdates, keydownVal, styleElem, styleRules, placeholder, timer, form, elem, len, i;

            // No-op (used in place of public methods when native support is detected)
            function noop() {}

            // Avoid IE9 activeElement of death when an iframe is used.
            // More info:
            // http://bugs.jquery.com/ticket/13393
            // https://github.com/jquery/jquery/commit/85fc5878b3c6af73f42d61eedf73013e7faae408
            function safeActiveElement() {
                try {
                    return document.activeElement;
                } catch (err) {}
            }

            // Hide the placeholder value on a single element. Returns true if the placeholder was hidden and false if it was not (because it wasn't visible in the first place)
            function hidePlaceholder(elem, keydownValue) {
                var type,
                    maxLength,
                    valueChanged = (!!keydownValue && elem.value !== keydownValue),
                    isPlaceholderValue = (elem.value === elem.getAttribute(ATTR_CURRENT_VAL));

                if ((valueChanged || isPlaceholderValue) && elem.getAttribute(ATTR_ACTIVE) === "true") {
                    elem.removeAttribute(ATTR_ACTIVE);
                    elem.value = elem.value.replace(elem.getAttribute(ATTR_CURRENT_VAL), "");
                    elem.className = elem.className.replace(classNameRegExp, "");

                    // Restore the maxlength value
                    maxLength = elem.getAttribute(ATTR_MAXLENGTH);
                    if (parseInt(maxLength, 10) >= 0) { // Old FF returns -1 if attribute not set (see GH-56)
                        elem.setAttribute("maxLength", maxLength);
                        elem.removeAttribute(ATTR_MAXLENGTH);
                    }

                    // If the polyfill has changed the type of the element we need to change it back
                    type = elem.getAttribute(ATTR_INPUT_TYPE);
                    if (type) {
                        elem.type = type;
                    }
                    return true;
                }
                return false;
            }

            // Show the placeholder value on a single element. Returns true if the placeholder was shown and false if it was not (because it was already visible)
            function showPlaceholder(elem) {
                var type,
                    maxLength,
                    val = elem.getAttribute(ATTR_CURRENT_VAL);
                if (elem.value === "" && val) {
                    elem.setAttribute(ATTR_ACTIVE, "true");
                    elem.value = val;
                    elem.className += " " + placeholderClassName;

                    // Store and remove the maxlength value
                    maxLength = elem.getAttribute(ATTR_MAXLENGTH);
                    if (!maxLength) {
                        elem.setAttribute(ATTR_MAXLENGTH, elem.maxLength);
                        elem.removeAttribute("maxLength");
                    }

                    // If the type of element needs to change, change it (e.g. password inputs)
                    type = elem.getAttribute(ATTR_INPUT_TYPE);
                    if (type) {
                        elem.type = "text";
                    } else if (elem.type === "password") {
                        if (Utils.changeType(elem, "text")) {
                            elem.setAttribute(ATTR_INPUT_TYPE, "password");
                        }
                    }
                    return true;
                }
                return false;
            }

            function handleElem(node, callback) {

                var handleInputsLength, handleTextareasLength, handleInputs, handleTextareas, elem, len, i;

                // Check if the passed in node is an input/textarea (in which case it can't have any affected descendants)
                if (node && node.getAttribute(ATTR_CURRENT_VAL)) {
                    callback(node);
                } else {

                    // If an element was passed in, get all affected descendants. Otherwise, get all affected elements in document
                    handleInputs = node ? node.getElementsByTagName("input") : inputs;
                    handleTextareas = node ? node.getElementsByTagName("textarea") : textareas;

                    handleInputsLength = handleInputs ? handleInputs.length : 0;
                    handleTextareasLength = handleTextareas ? handleTextareas.length : 0;

                    // Run the callback for each element
                    for (i = 0, len = handleInputsLength + handleTextareasLength; i < len; i++) {
                        elem = i < handleInputsLength ? handleInputs[i] : handleTextareas[i - handleInputsLength];
                        callback(elem);
                    }
                }
            }

            // Return all affected elements to their normal state (remove placeholder value if present)
            function disablePlaceholders(node) {
                handleElem(node, hidePlaceholder);
            }

            // Show the placeholder value on all appropriate elements
            function enablePlaceholders(node) {
                handleElem(node, showPlaceholder);
            }

            // Returns a function that is used as a focus event handler
            function makeFocusHandler(elem) {
                return function () {

                    // Only hide the placeholder value if the (default) hide-on-focus behaviour is enabled
                    if (hideOnInput && elem.value === elem.getAttribute(ATTR_CURRENT_VAL) && elem.getAttribute(ATTR_ACTIVE) === "true") {

                        // Move the caret to the start of the input (this mimics the behaviour of all browsers that do not hide the placeholder on focus)
                        Utils.moveCaret(elem, 0);

                    } else {

                        // Remove the placeholder
                        hidePlaceholder(elem);
                    }
                };
            }

            // Returns a function that is used as a blur event handler
            function makeBlurHandler(elem) {
                return function () {
                    showPlaceholder(elem);
                };
            }

            // Functions that are used as a event handlers when the hide-on-input behaviour has been activated - very basic implementation of the "input" event
            function makeKeydownHandler(elem) {
                return function (e) {
                    keydownVal = elem.value;

                    //Prevent the use of the arrow keys (try to keep the cursor before the placeholder)
                    if (elem.getAttribute(ATTR_ACTIVE) === "true") {
                        if (keydownVal === elem.getAttribute(ATTR_CURRENT_VAL) && Utils.inArray(badKeys, e.keyCode)) {
                            if (e.preventDefault) {
                                e.preventDefault();
                            }
                            return false;
                        }
                    }
                };
            }
            function makeKeyupHandler(elem) {
                return function () {
                    hidePlaceholder(elem, keydownVal);

                    // If the element is now empty we need to show the placeholder
                    if (elem.value === "") {
                        elem.blur();
                        Utils.moveCaret(elem, 0);
                    }
                };
            }
            function makeClickHandler(elem) {
                return function () {
                    if (elem === safeActiveElement() && elem.value === elem.getAttribute(ATTR_CURRENT_VAL) && elem.getAttribute(ATTR_ACTIVE) === "true") {
                        Utils.moveCaret(elem, 0);
                    }
                };
            }

            // Returns a function that is used as a submit event handler on form elements that have children affected by this polyfill
            function makeSubmitHandler(form) {
                return function () {

                    // Turn off placeholders on all appropriate descendant elements
                    disablePlaceholders(form);
                };
            }

            // Bind event handlers to an element that we need to affect with the polyfill
            function newElement(elem) {

                // If the element is part of a form, make sure the placeholder string is not submitted as a value
                if (elem.form) {
                    form = elem.form;

                    // If the type of the property is a string then we have a "form" attribute and need to get the real form
                    if (typeof form === "string") {
                        form = document.getElementById(form);
                    }

                    // Set a flag on the form so we know it's been handled (forms can contain multiple inputs)
                    if (!form.getAttribute(ATTR_FORM_HANDLED)) {
                        Utils.addEventListener(form, "submit", makeSubmitHandler(form));
                        form.setAttribute(ATTR_FORM_HANDLED, "true");
                    }
                }

                // Bind event handlers to the element so we can hide/show the placeholder as appropriate
                Utils.addEventListener(elem, "focus", makeFocusHandler(elem));
                Utils.addEventListener(elem, "blur", makeBlurHandler(elem));

                // If the placeholder should hide on input rather than on focus we need additional event handlers
                if (hideOnInput) {
                    Utils.addEventListener(elem, "keydown", makeKeydownHandler(elem));
                    Utils.addEventListener(elem, "keyup", makeKeyupHandler(elem));
                    Utils.addEventListener(elem, "click", makeClickHandler(elem));
                }

                // Remember that we've bound event handlers to this element
                elem.setAttribute(ATTR_EVENTS_BOUND, "true");
                elem.setAttribute(ATTR_CURRENT_VAL, placeholder);

                // If the element doesn't have a value and is not focussed, set it to the placeholder string
                if (hideOnInput || elem !== safeActiveElement()) {
                    showPlaceholder(elem);
                }
            }

            Placeholders.nativeSupport = test.placeholder !== void 0;

            if (!Placeholders.nativeSupport) {

                // Get references to all the input and textarea elements currently in the DOM (live NodeList objects to we only need to do this once)
                inputs = document.getElementsByTagName("input");
                textareas = document.getElementsByTagName("textarea");

                // Get any settings declared as data-* attributes on the root element (currently the only options are whether to hide the placeholder on focus or input and whether to auto-update)
                hideOnInput = root.getAttribute(ATTR_OPTION_FOCUS) === "false";
                liveUpdates = root.getAttribute(ATTR_OPTION_LIVE) !== "false";

                // Create style element for placeholder styles (instead of directly setting style properties on elements - allows for better flexibility alongside user-defined styles)
                styleElem = document.createElement("style");
                styleElem.type = "text/css";

                // Create style rules as text node
                styleRules = document.createTextNode("." + placeholderClassName + " { color:" + placeholderStyleColor + "; }");

                // Append style rules to newly created stylesheet
                if (styleElem.styleSheet) {
                    styleElem.styleSheet.cssText = styleRules.nodeValue;
                } else {
                    styleElem.appendChild(styleRules);
                }

                // Prepend new style element to the head (before any existing stylesheets, so user-defined rules take precedence)
                head.insertBefore(styleElem, head.firstChild);

                // Set up the placeholders
                for (i = 0, len = inputs.length + textareas.length; i < len; i++) {
                    elem = i < inputs.length ? inputs[i] : textareas[i - inputs.length];

                    // Get the value of the placeholder attribute, if any. IE10 emulating IE7 fails with getAttribute, hence the use of the attributes node
                    placeholder = elem.attributes.placeholder;
                    if (placeholder) {

                        // IE returns an empty object instead of undefined if the attribute is not present
                        placeholder = placeholder.nodeValue;

                        // Only apply the polyfill if this element is of a type that supports placeholders, and has a placeholder attribute with a non-empty value
                        if (placeholder && Utils.inArray(validTypes, elem.type)) {
                            newElement(elem);
                        }
                    }
                }

                // If enabled, the polyfill will repeatedly check for changed/added elements and apply to those as well
                timer = setInterval(function () {
                    for (i = 0, len = inputs.length + textareas.length; i < len; i++) {
                        elem = i < inputs.length ? inputs[i] : textareas[i - inputs.length];

                        // Only apply the polyfill if this element is of a type that supports placeholders, and has a placeholder attribute with a non-empty value
                        placeholder = elem.attributes.placeholder;
                        if (placeholder) {
                            placeholder = placeholder.nodeValue;
                            if (placeholder && Utils.inArray(validTypes, elem.type)) {

                                // If the element hasn't had event handlers bound to it then add them
                                if (!elem.getAttribute(ATTR_EVENTS_BOUND)) {
                                    newElement(elem);
                                }

                                // If the placeholder value has changed or not been initialised yet we need to update the display
                                if (placeholder !== elem.getAttribute(ATTR_CURRENT_VAL) || (elem.type === "password" && !elem.getAttribute(ATTR_INPUT_TYPE))) {

                                    // Attempt to change the type of password inputs (fails in IE < 9)
                                    if (elem.type === "password" && !elem.getAttribute(ATTR_INPUT_TYPE) && Utils.changeType(elem, "text")) {
                                        elem.setAttribute(ATTR_INPUT_TYPE, "password");
                                    }

                                    // If the placeholder value has changed and the placeholder is currently on display we need to change it
                                    if (elem.value === elem.getAttribute(ATTR_CURRENT_VAL)) {
                                        elem.value = placeholder;
                                    }

                                    // Keep a reference to the current placeholder value in case it changes via another script
                                    elem.setAttribute(ATTR_CURRENT_VAL, placeholder);
                                }
                            }
                        } else if (elem.getAttribute(ATTR_ACTIVE)) {
                            hidePlaceholder(elem);
                            elem.removeAttribute(ATTR_CURRENT_VAL);
                        }
                    }

                    // If live updates are not enabled cancel the timer
                    if (!liveUpdates) {
                        clearInterval(timer);
                    }
                }, 100);
            }

            Utils.addEventListener(global, "beforeunload", function () {
                Placeholders.disable();
            });

            // Expose public methods
            Placeholders.disable = Placeholders.nativeSupport ? noop : disablePlaceholders;
            Placeholders.enable = Placeholders.nativeSupport ? noop : enablePlaceholders;

        }(this));

    };

    J.jumpStart(HTML);

}(window.J));