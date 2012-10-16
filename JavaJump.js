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
//	Objects extends - for prototype inheritance.
Object.prototype.extends = function(o)
{
	//set my prototype to my parent class.
	this.prototype = o.prototype;
	//and my constructor function to myself.
	this.prototype.constructor = this;
	return this;
}
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
			for(i; i < arguments.length; i = i + 1)
			{
				if(i >= 1)
					{args +=", "}					
				args += "arguments[" + i + "]";
			}
			
			eval("this.init("+args+");");
			
		}else{
			this.init();	
		}
	}
	a.prototype.init = function(){};
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
	function start(e){J.Start(e);};
	window.addEventListener('load',start,false);
}else{
	window.onload = function(evt){
		evt = evt || window.event;
		J.Start(evt);
	}
}

