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
			this.checkbox.addEventListener("click",function(evt){
				console.log(_self);
				_self["ontoggle"](_self);
				if(_self.checkbox.checked){
					_self.setState("enable");
				}else{
					_self.setState("disable");
				}
			},false);
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