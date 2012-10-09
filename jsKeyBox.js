// JsKeyBox !! A.K.A name = JKB
//	A JavaJump Box for working with Key presses

function jsKeyBox(){}

jsKeyBox.prototype.Jump = function(){
	this.name = "JKB";
	this.errors = [];
	this.shortCuts = [];
	this.tracker = [];
	this.keyLookup= {SHIFT:16, S:83};
}

jsKeyBox.prototype.eventListener = function(){
	var controller = this;
	
	var catchPress = function(e){
		e = e || window.event;
		target = e.target || window.event.srcElement;
		
		if(e && target.nodeName != "INPUT"){
			
			var code = e.keyCode || e.which;
			
			if(!controller.tracker[0] || controller.tracker[0] != code){
				controller.tracker.push(code);	
			}
			
			if(controller.tracker.length >= 2){
				var action = controller.execute();
				if(action == true){
					e.cancelBubble = true;
					e.returnValue = false;
			
					//e.stopPropagation works in Firefox.
					if (e.stopPropagation) {
						e.stopPropagation();
						e.preventDefault();
					}
				}
			}	
		}
	}
	
	var clearPress = function(e){
		e = e || window.event;
		if(e){
			var code = e.keycode || e.which;
			var positionCheck = controller.tracker.indexOf(code);
			if(positionCheck != -1){
				controller.tracker = [];
			}			
		}else{
			return false	
		}
	}
		
	
	if(document.addEventListener){
		document.addEventListener('keydown',catchPress,false);
		document.addEventListener('keyup',clearPress,false);
	}else if(document.attachEvent){
		document.attachEvent('onkeydown',catchPress);
		document.attachEvent('onkeyup',clearPress);
	}else{
		var err = {code:"1",detail:"Failed to add event listener"};
		this.errors.push(err);
	}
}



jsKeyBox.prototype.assignShortcut = function(str,callback){
	if(typeof(str) == "undefined"){
		this.errors.push({code:"2",detail:"No shortcut submitted"});
		return false;
	}else{
		this.shortCuts.push({shortcut:str,action:callback});
		this.eventListener();
	}	
	return true;
}

jsKeyBox.prototype.unAssignShortcut = function(str){
	if(typeof(str) == "undefined"){
		this.errors.push({code:"2",detail:"No shortcut submitted"});
		return false;
	}else{
		for (var i =0; i< this.shortCuts.length; i++){
			if (this.shortCuts[i].shortcut == str){
				this.shortCuts.splice(i,1);
			}
		}
		this.eventListener();
	}	
	return true;
}


jsKeyBox.prototype.getCode = function(keyName){
	if(this.keyLookup[keyName]){
		return this.keyLookup[keyName];
	}
}


jsKeyBox.prototype.execute = function(){
	
	for (var i = 0; i<this.shortCuts.length;i++){
		var keys = this.shortCuts[i].shortcut.split("+");	
		
		if (this.tracker[0] == this.getCode(keys[0]) && this.tracker[1] == this.getCode(keys[1])){
			this.shortCuts[i].action();
			this.tracker = [];
			return true;
		}
	}
	
	
	this.tracker = [];
	return false;		
}

//jsKeyBox.prototype.

J.Jboxes.push(new jsKeyBox());