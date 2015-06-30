/*@
	trigger: primary trigger interface class.
	package: JavaJump.triggers.	
*/
(function (n, J) {
    "use strict";
    /* Package definition */
    J.triggers = J.triggers || {};
    
	if (n) {
        
        var e = 0, noop = function () {};
        
		n.trigger = new J.Class();
		/*@
			events: class constant variable possible states and events.
			type: Array<string>
			class: trigger
		 */
		n.trigger.prototype.events  = ["toggle", "enable", "disable"];
		n.trigger.prototype.onenable = noop;
		n.trigger.prototype.ondisable = noop;
		n.trigger.prototype.ontoggle = noop;
		n.trigger.prototype.initEvents = function () {
			for (e; e < this.events.length; e += 1) {
				this["on" + this.events[e]] = noop;
			}
		};
		
		n.trigger.prototype.addEventListener = function (eventName, callback) {
			if (this.events.indexOf(eventName) !== -1) {
				var name = this.events[this.events.indexOf(eventName)];
				this["on" + name] = callback;
			}
		};
		n.trigger.prototype.getState = function () {throw ("Unimplemented method"); };
		n.trigger.prototype.setState = function (newState) {
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