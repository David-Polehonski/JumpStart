/*
||**********************************||
||	stage -
||  	jStage - main control class
||
||**********************************||
*/
var stage = new Class();

stage.prototype.init = function(canvasEl){
        this.EL = canvasEl;
        this.EL.stage = this;
        this.context = canvasEl.getContext("2d");
        this.bufferObj = document.createElement('canvas');
        this.buffer = this.bufferObj.getContext("2d");
        
        this.buffer.canvas.width = this.context.canvas.width;
        this.buffer.canvas.height = this.context.canvas.height;
        
        this.frameRate = 1000/60;   
        this.debug = true;
        
		this.scenes = new Array();
		this.currentScene = 0;
		this.scenes[this.currentScene] = new Object();
		this.scenes[this.currentScene].actors = new Array();
		
		function newScene()
		{
			var a = new Array();
			this.scenes[currentScene + 1].actors = new Array();
		}	
		
		        
        this.mouse = {
                        x:0,
                        y:0,
                        events:{
                                'click':new Array(),
                                'move':new Array(),
                                'drag':new Array(),
                                'release':new Array()
                        }
                }
        this.mouse.hitArea = new hitArea(this.mouse),
        this.mouse.hitArea.setType('circ',{'center':[0,0],'radius':1});
        
        /*stage Event lisnters - catches event to be passed into stage context*/        
        function clickEvt(e){
                e = e || window.event;
                e.stopPropagation();
                this.stage.clicked(e);
        }
        function moveEvt(e){
                e = e || window.event;
                e.stopPropagation();
                this.stage.move(e);
        }
        function dragEvt(e){
                e = e || window.event;
                e.stopPropagation();
                this.stage.startDrag(e);
        }
        function dragoffEvt(e){
                e = e || window.event;
                e.stopPropagation();
                this.stage.stopDrag(e);
        }
        
        if(this.EL.addEventListener){
                this.EL.addEventListener('click',clickEvt,false);
                this.EL.addEventListener('mousemove',moveEvt,false);
                this.EL.addEventListener('mousedown',dragEvt,false);
                this.EL.addEventListener('mouseup',dragoffEvt,false);
        }else{
                this.EL.onclick = clickEvt;
                this.EL.onmousemove = moveEvt;
                this.EL.onmousedown = dragEvt;
                this.EL.onmouseup = dragoffEvt;
        }
        
        /*Event Funcitons*/
        this.startDrag = function(e){
                this.getMouse(e);
        }
        this.stopDrag = function(e){
                this.getMouse(e);
        }
        this.clicked = function(e){
                this.getMouse(e);
                for(var i=0;i<this.mouse.events.click.length;i++)
                {
                	this.mouse.events.click[i]();
               	}
        	return null;
        }
        
        this.move = function(e){
                this.getMouse(e);
                for(var i=0;i<this.mouse.events.move.length;i++)
                {
                        this.mouse.events.move[i]();
                        }
        }

        /*Begin Frame rendering
        this.frames = new Framerate();
        this.frames.setRate(this.FrameRate);
        this.frames.reset();*/
        
        render = function(){
                canvasEl.stage.renderRun();     
        }
        
        this.run = setInterval(render,30);              
        return this;
};

stage.prototype.getOffsetPosition = function(obj){
                var offsetX = offsetY = 0;
        
                if (obj.offsetParent) {
                        do {
                                offsetX += obj.offsetLeft;
                                offsetY += obj.offsetTop;
                        }while(obj = obj.offsetParent);
                }       
                return [offsetX,offsetY];
        }
        
stage.prototype.getMouse = function(e){
                OFFSET = this.getOffsetPosition(this.EL);
                
                this.mouse.x = (e.pageX || (e.clientX + document.body.scrollLeft +  document.documentElement.scrollLeft)) - OFFSET[0];
                this.mouse.y = (e.pageY || (e.clientY + document.body.scrollTop + document.documentElement.scrollTop)) - OFFSET[1];     
        
                return 0;
        }

stage.prototype.renderRun = function(){
        /*var f = this.frames.getFrames();  Number of frames passed since last render*/
        
        /*Run Code*/
        
		var scene = this.scenes[this.currentScene];
		
        for(var i = 0; i<scene.actors.length; i++){
                scene.actors[i].run();     
        }
        
        /*Render the program Imagery*/
        this.buffer.clearRect (0,0,this.bufferObj.width, this.bufferObj.height);
        this.context.clearRect (0,0,this.bufferObj.width, this.bufferObj.height);
        
        /*Render Code*/
        
        for(var i = 0; i<scene.actors.length; i++){
                scene.actors[i].render(this.buffer);     
        }
        
        if(this.debug){
                var fillText = "x:" + this.mouse.x + " y: " + this.mouse.y
                
                this.buffer.save();
                        
                this.buffer.fillStyle = "#000000";
                this.buffer.fillRect(0,0,this.buffer.width,this.buffer.height);
                this.buffer.textBaseline="top";
                this.buffer.font="20pt Arial";
                this.buffer.fillStyle="red";
                this.buffer.fillText(fillText,20,20);
                
                this.buffer.restore();  
        }
        /*Draw it*/
        this.context.drawImage(this.bufferObj,0,0);
        
        return 0;
}

stage.prototype.program = function(args){
        args = args || {};
}

stage.prototype.addObject = function(actor){
	this.scenes[this.currentScene].actors.push(actor);        
}