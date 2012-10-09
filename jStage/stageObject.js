/*
||	jStage
|| 		stageObject class
*/
stageObject = Class();

stageObject.prototype.init = function(instanceName,stage)
{
	this.name = instanceName;
    this.stage = stage;
    this.x = this.y = this.rotation = 0;
    stage.addObject(this);
    this.hitArea = null;
}

stageObject.prototype.render = function(C){
        //Must be be able to render the object  
}
stageObject.prototype.run = function(C){
        //Must be be able to run the objects Logid 
}

stageObject.prototype.listen = function(evt,callback){
        this.stage.mouse.events[evt].push(callback);
}

stageObject.prototype.createHitArea = function(type,args){
        this.hitArea = new hitArea(this);
}

stageObject.prototype.hitTest = function(targetObj){
        if(this.hitArea != null && targetObj.hitArea != null){
                switch(this.hitArea.type){
                case 'rect':
                        //HitTest Logic
                        break;
                case 'circ':
                        //HitTest Logic
                        break;
                default:
                        break;
                }
        }else{
                return false;   
        }
}
