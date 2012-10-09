/*
||***************************************||
||	JavaJumpStart!
||		Version 1.1
||		- Acts as a platform / namespace
||		for JavaJump style programs
||	changelog
||		-05/07/2012:
||			added object extensibility
||			and class function.
||***************************************||
*/
var J;
//	Objects extends - for prototype inheritance.
Object.prototype.extends = function(o)
{
	//set my prototype to my parent class.
	this.prototype = new o();
	//and my constructor function to myself.
	this.prototype.constructor = this;
}
//	Class() - syntactic sugar function.
function Class()
{
	"use strict";
	//return a new class
	return function()
	{
		if(arguments.length > 0)
		{
			this.init(arguments);
		}
	}
};


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

