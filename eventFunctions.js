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

}(window.J));
