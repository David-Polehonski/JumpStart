/*
||***************************************||
||	JavaJumpStart!
||		Version 1.2
||		- Acts as a platform / namespace
||		for JavaJump style programs
||	changelog
||		-16/10/2012: 1.2
||			Added auto instantiation, and 
||			init method with args.
||			fixed Object.extends()
||		-05/07/2012: 1.1
||			added object extensibility
||			and class function.
||***************************************||
*/
var J;


//	Class() - syntactic sugar function.
function Class()
{
	"use strict";
	var i=0, args = "", a;
	
	//Build basic Class
	a = function()
	{
		if(arguments.length > 0)
		{
			this.init.apply(this,arguments);
		}else{
			this.init();	
		}
	}
	a.prototype.init = function(){};
	//	Objects extends - for prototype inheritance.
	a.extend = function(o)
		{
			//set my prototype to my parent class.
			this.prototype = o.prototype;
			//and my constructor function to myself.
			this.prototype.constructor = this;
			
			return this;
		}
	
	// Object Implements properties from other prototype, f = destructive flag.
	a.implement = function(o,f)
		{
			"use strict";
			var i, flag = f || false;
			//For all prototpe properties
			for(i in o.prototype)
			{
				//	If the property doesn't exist, or destructive is switched on.
				if(typeof(this.prototype[i]) == "undefined" || (flag && this.prototype[i] != "init"))
				{
					this.prototype[i] = o.prototype[i];
				}
			}	
			
			return this;
		}
	//return a new class 
	return a;
}



function JavaJump(){
	this.Jboxes = new Array();
	this.onloadEvent = "";
}

JavaJump.prototype.Main = function(){
	//Default function	
}

JavaJump.prototype.Start = function(e) {
	for (var i = 0; i< this.Jboxes.length; i++){
		this.Jboxes[i].Jump();	
		this[this.Jboxes[i].name] = this.Jboxes[i];
	}
	this.Main();
}

J = new JavaJump();

if(window.addEventListener){	
	window.addEventListener('load',function (e){J.Start(e);},false);
}else{
	window.onload = function(evt){
		"use strict";
		evt = evt || window.event;
		J.Start(evt);
	}
}

