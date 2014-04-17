(function(n){
	if(J && n.trigger){
		n.checkboxTrigger = new J.Class().extend(n.trigger);
		n.checkboxTrigger.prototype.init = function(checkbox){
			this.initEvents();
			this.checkbox = checkbox;
			if(this.checkbox.checked){
				this.setState("enable");
			}else{
				this.setState("disable");
			}
			var _self = this;
			
			function listener(evt){
				_self["ontoggle"](_self);
				if(_self.checkbox.checked){
					_self.setState("enable");
				}else{
					_self.setState("disable");
				}
			}
			
			//	IE8 Compatability
			if(this.checkbox.addEventListener){
				this.checkbox.addEventListener("click",listener,false);	
			}else{
				this.checkbox.onclick = function(e){
					var E = e || window.event;
					listener(E);
				};
			}			
		}
		n.checkboxTrigger.prototype.getState = function(){
			if(this.checkbox.checked){
				return "enable";
			}else{
				return "disable";
			}
		}
		return;
	}else{
		throw("Missing dependencies");
		return;
	}
})(J.triggers);