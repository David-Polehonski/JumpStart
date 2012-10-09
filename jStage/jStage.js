/*
||**********************************||
||	jStage -
||		JavaJump class for working with
||		html5 canvas 2D contexts
||
||**********************************||
*/

function jStage(){
	//Check for canvas support
	this.canvasSupport = document.createElement('canvas').getContext ? true : false;
	//Save class name for JavaJump
	this.name="jStage";
	return this;
}

jStage.prototype.Jump = function(){
	//Document is now loaded.
	if(this.canvasSupport){
		//Get all canvases
		this.canvases = document.getElementsByTagName('canvas');
		//Create stages Array
		this.stages =  new Array();
		//For each canvas element, 
		for(var i=0; i<this.canvases.length;i++){
			//create a stage and append it to the stages Array
			try
			{
				this.stages.push(new stage(this.canvases[i]));
			}catch(e)
			{
				if(!stage)
				{
					console.log("stage libraries not included");
				}else{
					console.log("unexpexted error: " + e);
				}
				return false;
			}
		}
		//then return true
		return true;
	}
	//if canvases are not supported return false.
	return false;
}

jStage.prototype.getStage = function(stageName){
	//For each canvas,
	for(var i=0;i<this.canvases.length;i++){
		//if the canvas' id is the argument: stageName 
		if(this.canvases[i].id==stageName){
			//return that stage
			return this.canvases[i].stage;	
		}
	}
	//else if the element is not found in the array
	return null;
}
/*
||	Add jStage to J object
*/
J.Jboxes.push(new jStage());