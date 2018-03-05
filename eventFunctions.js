/*@eventFunctions.js
	Injects polyfills and helper methods for dealing with events.
*/
(function (J) {
	"use strict";
	/* Polyfil for custom events*/
	window.CustomEvent = function( eventName, defaultInitDict ) {
		function CustomEvent(type, eventInitDict) {
			var event;
			if ('createEvent' in document){
				event = document.createEvent(eventName);
				if (type !== null) {
					initCustomEvent.call(
						event,
						type,
						(eventInitDict || (eventInitDict = defaultInitDict)).bubbles,
						eventInitDict.cancelable,
						eventInitDict.detail
					);
				} else {
					event.initCustomEvent = initCustomEvent;
				}
			} else {
				event = document.createEventObject();
				event.type = type;
			}

			return event;
		}

		function initCustomEvent(type, bubbles, cancelable, detail) {
			this['init' + eventName](type, bubbles, cancelable, detail);
			if (!('detail' in this)){
				this.detail = detail;
			}
		}

		return CustomEvent;
	}(
		'CustomEvent' in window ? 'CustomEvent' : 'Event',
		{
			bubbles: false,
			cancelable: false,
			detail: null
		}
	);

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

	var supportsPassive = false;
	try {
		var opts = Object.defineProperty({}, 'passive', {
			get: function() {
				supportsPassive = true;
			}
		});
		window.addEventListener("testPassive", null, opts);
		window.removeEventListener("testPassive", null, opts);
	} catch (e) { }
	window.J.set('supportsPassiveEvents', supportsPassive);
}(window.J));
