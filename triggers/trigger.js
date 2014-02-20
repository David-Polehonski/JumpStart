/*@
	trigger: primary trigger interface class.
	package: JavaJump.triggers.	
*/
(function(n){
	if(J){
		n.trigger = new J.Class();
		/*@
			events: class constant variable possible states and events.
			type: Array<string>
			class: trigger
		 */
		n.trigger.prototype.events  = ["toggle","enable","disable"];
		n.trigger.prototype.onenable = function(){};
		n.trigger.prototype.ondisable = function(){};
		n.trigger.prototype.ontoggle = function(){};
		n.trigger.prototype.initEvents = function(){
			for(var e = 0; e < this.events.length; e++){
				this["on"+this.events[e]] = function(){};
			}
		}
		
		n.trigger.prototype.addEventListener = function(eventName,callback){
			if(this.events.indexOf(eventName) != -1){
				var name = this.events[this.events.indexOf(eventName)];
				this["on" + name] = callback;
			}
		}
		n.trigger.prototype.getState = function(){throw("Unimplemented method");}
		n.trigger.prototype.setState = function(newState){
			this.state = newState
			if(this.events.indexOf(this.state) != -1){
				try{
					this["on" + this.state](this);
				}catch(e){
					console.log("Event Error :"+this.state);
					return;
				}
			}
		}
		return;
	}else{
		throw("Undefined JavaJump");
		return;
	}
})(J.triggers = J.triggers || {})