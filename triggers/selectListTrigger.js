(function(n){
	if(J && n.trigger){
		n.selectListTrigger = new J.Class().extend(n.trigger);
		n.selectListTrigger.prototype.init = function(selectElement,arrayOfValues){
			this.select = selectElement;
			this.triggerValues = arrayOfValues;
			this.setState(this.getState());
			var _self = this;
			if(this.select.addEventListener){
				this.select.addEventListener("change",function(){
					_self.setState(_self.getState());
				});
			}else{
				
				this.select.attachEvent('onchange',function(){
					_self.setState(_self.getState());
				});
			}
		};
		
		n.selectListTrigger.prototype.getSelected = function(){
			return this.select.options[this.select.selectedIndex];
		};
		
		n.selectListTrigger.prototype.getState = function(){
			var selected = this.getSelected();
			if(this.triggerValues.indexOf(selected.value) >= 0){
				return "enable";
			}else{
				return "disable";
			}
		};
		
		return;
	}else{
		throw("Missing dependencies");
		return;
	}
})(J.triggers);