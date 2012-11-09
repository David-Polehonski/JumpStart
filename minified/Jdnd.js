if(J.dataGrabber){J.dragAndDrop=new Class().implement(J.dataGrabber);}else{J.dragAndDrop=new Class();}J.dragAndDrop.prototype.init=function(element){"use strict";this.E=element;if(!this.E.hasAttribute){this.E.hasAttribute=function(name){var returnVar=false;if(this[name]){returnVar=true;}return returnVar;};}};J.dragAndDrop.prototype.onDrag=function(e){"use strict";e.preventDefault();};J.dragAndDrop.prototype.onEnd=function(e){"use strict";e.preventDefault();};J.dragAndDrop.prototype.onEnter=function(e){"use strict";e.preventDefault();};J.dragAndDrop.prototype.onOver=function(e){"use strict";e.preventDefault();};J.dragAndDrop.prototype.onLeave=function(e){"use strict";e.preventDefault();};J.dragAndDrop.prototype.onDrop=function(e){"use strict";e.preventDefault();};J.dragAndDrop.prototype.setListeners=function(){"use strict";var events={"dragstart":this.onDrag,"dragend":this.onEnd,"dragover":this.onOver,"dragenter":this.onEnter,"dragleave":this.onLeave,"drop":this.onDrop};function eventHandler(E){var e=E||window.event;e.cancelBubble=true;if(!e.target){e.target=e.srcElement;}if(!e.preventDefault){e.preventDefault=function(){this.returnValue=false;};}events[e.type](e);}if(window.addEventListener){if(this.E.hasAttribute('draggable')&&this.E.getAttribute('draggable')==="true"){this.E.removeEventListener("dragstart",this.onDrag,false);this.E.removeEventListener("dragend",this.onEnd,false);}else{this.E.removeEventListener("dragover",this.onOver,false);this.E.removeEventListener("dragenter",this.onEnter,false);this.E.removeEventListener("dragleave",this.onLeave,false);this.E.removeEventListener("drop",this.onDrop,false);}if(this.E.hasAttribute('draggable')&&this.E.getAttribute('draggable')==="true"){this.E.addEventListener("dragstart",this.onDrag,false);this.E.addEventListener("dragend",this.onEnd,false);if(this.E.dragDrop){this.E.addEventListener("mousemove",function(e){if(window.event){var t=e.target;if(window.event.button===1){t.dragDrop();}}return false;},false);}}else{this.E.addEventListener("dragover",this.onOver,false);this.E.addEventListener("dragenter",this.onEnter,false);this.E.addEventListener("dragleave",this.onLeave,false);this.E.addEventListener("drop",this.onDrop,false);}}else{if(this.E.hasAttribute('draggable')&&this.E.getAttribute('draggable')==="true"){this.E.ondragstart=eventHandler;this.E.ondragend=eventHandler;this.E.onmousemove=function(E){var e=E||window.event,t=e.srcElement;if(window.event.button===1){t.dragDrop();}};}else{this.E.ondragover=eventHandler;this.E.ondragenter=eventHandler;this.E.ondragleave=eventHandler;this.E.ondrop=eventHandler;}}};J.dragAndDrop.prototype.toString=function(){"use strict";return"Drag And Drop Element";};