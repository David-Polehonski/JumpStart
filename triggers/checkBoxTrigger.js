(function (J, n) {
    "use strict";
	if (J && n.trigger) {
		n.checkboxTrigger = new J.Class().extend(n.trigger);
		n.checkboxTrigger.prototype.init = function (checkbox) {
			this.initEvents();
			this.checkbox = checkbox;
			if (this.checkbox.checked) {
				this.setState("enable");
			} else {
				this.setState("disable");
			}
			var self = this;
			
			function listener(evt) {
                
				self.ontoggle(self);
				if (self.checkbox.checked) {
					self.setState("enable");
				} else {
					self.setState("disable");
				}
			}
			
			//	IE8 Compatability
			if (this.checkbox.addEventListener) {
				this.checkbox.addEventListener("click", listener, false);
			} else {
				this.checkbox.onclick = function (e) {
					var E = e || window.event;
					listener(E);
				};
            }
		};
        
		n.checkboxTrigger.prototype.getState = function () {
			if (this.checkbox.checked) {
				return "enable";
			} else {
				return "disable";
			}
		};
		return;
	} else {
		throw ("Missing dependencies");
	}
}(window.J, window.J.triggers));