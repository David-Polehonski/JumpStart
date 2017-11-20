/*
	jTriggers.js;
	Imports the Triggers interface allowing polymorphic event handling, by defining
*/
(function (J) {
	"use strict";

	J.Triggers = J.Triggers || {};

	function noop () {};
	var e = 0;

	if (J.Triggers) {
		var trigger = J.Class('trigger');
		/*@
			events: all possible state events that can trigger events
			type: Array<string>
		 */
		trigger.prototype.events  = ["toggle", "enable", "disable"];

		trigger.prototype.init = function () {
			this.initEvents();
		};

		trigger.prototype.initEvents = function () {
			for (e; e < this.events.length; e += 1) {
				this["on" + this.events[e]] = noop;
			}
		};

		trigger.prototype.addEventListener = function (eventName, callback) {
			if (this.events.indexOf(eventName) !== -1) {
				var name = this.events[this.events.indexOf(eventName)];
				this["on" + name] = callback;
			}
		};

		trigger.prototype.getState = function () { return this.state; };
		trigger.prototype.setState = function (newState) {
			this.state = newState;
			if (this.events.indexOf(this.state) !== -1) {
				try {
					this["on" + this.state](this);
				} catch (e) {
					// console.log("Event Error :"+this.state);
					return;
				}
			}
		};
		return;
	} else {
		throw ("Undefined JavaJump");
	}
}(window.J));
