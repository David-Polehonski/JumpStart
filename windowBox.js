/*
|**************************************************|
|	Window Box -  A JBox - created a modal window
|		to post messages to.
|**************************************************|
*/

function win(){};

/*
|**************************************************|
|	The mandetory Jump()
|**************************************************|
*/
win.prototype.Jump = function (){
	var scripts, i, path, CSS, newDiv;
	
	this.name = "WIN";
	this.windows = new Array();
	this.currentWindow = 0;
	
	scripts = document.getElementsByTagName('script');
	for( i=0; i<scripts.length; i++){
		if(scripts[i].src.indexOf("windowBox.js") != -1){
			//Get path
			path = scripts[i].src.substr(0,scripts[i].src.lastIndexOf("/"));
			path += "/windowBox.css";
		}
	}
	
	CSS = document.createElement("link");
	CSS.type ="text/css";
	CSS.href = path;
	CSS.rel = "stylesheet";
	
	document.getElementsByTagName("head")[0].appendChild(CSS);	
	
	var newDiv = document.createElement('div');
	
	this.background = document.body.appendChild(newDiv);
	this.background.id = "windowBackground";
	this.background.parent = this;
	this.background.onclick = function(e){
		e = e || window.event;
			
		co_ords = this.parent.getOffsetPosition();
		
		mouse = this.parent.getMouse(e);
		this.parent.hideWindow();
		
	}
}

win.prototype.getOffsetPosition = function(obj){
                var offsetX = offsetY = 0;
				
				obj = (typeof(obj) != 'undefined' ? this.windows[obj] : this.windows[this.currentWindow]);
				
				var width = obj.clientWidth;
				var height = obj.clientHeight;
				
        		if (obj.offsetParent) {
                        do {
                                offsetX += obj.offsetLeft;
                                offsetY += obj.offsetTop;
                        }while(obj = obj.offsetParent);
                }       
                return [offsetX,offsetY,offsetX+width,offsetY+height];
        }
        
win.prototype.getMouse = function(e){
                x = (e.pageX || (e.clientX + document.body.scrollLeft +  document.documentElement.scrollLeft));
                y = (e.pageY || (e.clientY + document.body.scrollTop + document.documentElement.scrollTop));     
        
                return [x,y];
        }

win.prototype.newWindow=function(width, height,closeable){
	var newWin, id;
	
	closeable = typeof(closeable) != 'undefined' ? closeable : 'false';
	
	newWin = document.createElement('div');
	
	if(typeof(width) != "undefined"){
		newWin.style.width	= width;
	}
	if(typeof(height) != "undefined"){
		newWin.style.height	= height;
	}
	newWin.style.top = "0px";
	newWin.style.left = "0px";
	newWin.style.marginTop = "150px";
	newWin.style.zIndex = "60";
	newWin.className = "window";
	newWin.onclick = function(e)
	{
		e.stopPropagation();
		e.stopImmediatePropagation();	
	}
	if(closeable == true){
		closeDiv  = document.createElement('div');
		closeDiv.className = "windowCloseButton";
		closeDiv.innerHTML = "Close window <span>[x]</span>";
		closeDiv.parent = this;
		closeDiv.onclick = function(){ this.parent.hideWindow(); };
		//Attach close option//
		newWin.appendChild(closeDiv);
	}
	
	
		
	id = this.windows.push(this.background.appendChild(newWin)) -1;
	return id;
}

win.prototype.showWindow= function(winID){
	
	winID = (typeof(winID) != 'undefined' ? winID : this.currentWindow);
	
	if(typeof(this.windows[winID]) != "undefined"){
	
		this.background.style.display="block";
		this.windows[winID].style.display="block";
		this.currentWindow = winID;
	}
}

win.prototype.hideWindow = function (winID){
	
	winID = (typeof(winID) != 'undefined' ? winID : this.currentWindow);
	
	
	if(this.windows[winID].onclose)
	{
		this.windows[winID].onclose();
	}
	
	
	if(typeof(this.windows[winID]) != "undefined"){
		this.background.style.display="none";
		this.windows[winID].style.display="none";
		this.currentWindow = winID;
	}
}

win.prototype.postMessage = function(message,winID){
	
	if(typeof(winID) == "undefined"){
		winID = this.currentWindow;	
	}
	
	if(typeof(this.windows[winID]) != "undefined"){
		var win =  this.windows[winID];
		var content =  document.createElement('div');
		content.innerHTML = message;
		win.appendChild(content);
			
	}
}

win.prototype.appendContent = function(node,winID){
	if(typeof(winID) == "undefined"){
		winID = this.currentWindow;	
	}
	
	if(typeof(this.windows[winID]) != "undefined"){
		var win =  this.windows[winID];
		node.style.Zindex = "500";
		win.appendChild(node);				
	}
}
/*
|**************************************************|
|	Always End with instantiation
|**************************************************|
*/
J.Jboxes.push(new win());
