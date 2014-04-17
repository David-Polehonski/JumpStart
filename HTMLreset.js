// JavaScript Document - HTML 5 BODGE IT! (JavaJumpBox)

/*
||	Version 0.3
||		ChangelLog:
||			V 0.3:	added code for IndexOf to fix older browsers
||			V 0.2:	added code for JavaJump integration.
||			V 0.1: added element creation.
*/

//Function Bodges the new elements//
document.createElement('header');
document.createElement('hgroup');
document.createElement('nav');
document.createElement('menu');
document.createElement('section');
document.createElement('article');
document.createElement('aside');
document.createElement('footer');

document.createElement('figure');
document.createElement('figcaption');

document.createElement('details');
document.createElement('summary');

document.createElement('canvas');

document.createElement('command');
document.createElement('data');
document.createElement('datalist');

document.createElement('audio');
document.createElement('track');
document.createElement('video');
document.createElement('embed');
document.createElement('source');

document.createElement('eventsource');

document.createElement('keygen');
document.createElement('output');
document.createElement('progress');

document.createElement('ruby');
document.createElement('rp');
document.createElement('rt');

document.createElement('wbr');	/*Specifies an opportunity for line-breaks in long words*/
document.createElement('mark');
document.createElement('meter');
document.createElement('time');

function HTML5(){};

HTML5.prototype.Jump = function(){
	this.name="HTML5";
	var newStyle = document.getElementsByTagName('head')[0].appendChild(document.createElement('style'));
	newStyle.styleSheet.addRule("html.ie *","zoom:1;",0);
}

J.Jboxes.push(new HTML5());
/*Array.indexOf*/
if(!Array.prototype.indexOf){Array.prototype.indexOf=function(s){try{var j=this.length,a=(!isNaN(arguments[1]))?arguments[1]:null||null;var i=(a != null)?a:0;for(i;i<j;i++){if(this[i]==s){return i;}}return -1;}catch(e){console.log("indexOf: ERROR"+e);return -1;}}};

// Poly fill BIND courtesy of MDN
if (!Function.prototype.bind) {
	Function.prototype.bind = function (oThis) {
	if (typeof this !== "function") {
		// closest thing possible to the ECMAScript 5 internal IsCallable function
		throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
	}

	var aArgs = Array.prototype.slice.call(arguments, 1), 
	    fToBind = this, 
	    fNOP = function () {},
	    fBound = function () {
	    return fToBind.apply(this instanceof fNOP && oThis
	                             ? this
	                             : oThis,
	                             aArgs.concat(Array.prototype.slice.call(arguments)));
	};

	fNOP.prototype = this.prototype;
	fBound.prototype = new fNOP();

	return fBound;
	};
}
