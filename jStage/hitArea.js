/*
 *	Jstage
 * 		hitArea class
 *		Basic class must exist withing a stage Object parent class
 */

var hitArea = new Class();

hitArea.prototype.init = function(x){
        this.parent = x;
}

hitArea.prototype.setType=function(type,args){
        switch(type){
                case 'rect':
                        this.type="rect";
                        this.dimensions = {
                                "center":args.origin || [0,0],
                                "width":args.width || 0,
                                "height":args.height || 0,
                                "rotation":args.rotation||0
                        }
                        break;
                case 'circ':
                        this.type="circ";
                        this.dimensions = {
                                "center":args.center || [0,0],
                                "radius":args.radius ||0
                        }
                        break;
                default:
                        throw("Invalid Type");  
                        break;
        }
}

hitArea.prototype.x = function()
{
        return this.parent.x + this.dimensions.center[0];
}
hitArea.prototype.y = function()
{
        return this.parent.y + this.dimensions.center[1];
}

hitArea.prototype.origin_x = function()
{
	switch (this.type)
	{
		case 'rect':
			return this.dimensions.center[0] - (this.dimensions.width/2);
			break;
		case 'circ':
			return this.dimensions.center[0];
			break;
	}
        
}
hitArea.prototype.origin_y = function()
{
	switch (this.type)
	{
		case 'rect':
			return this.dimensions.center[1] - (this.dimensions.height/2);
			break;
		case 'circ':
			return this.dimensions.center[1];
			break;
	}
}

hitArea.prototype.rotation = function()
{
	return ((this.dimensions.rotation+this.parent.rotation)*(Math.PI/180));
}

hitArea.prototype.render = function(C){
                switch(this.type){
                case 'rect':
                        C.save();
                        C.fillStyle = 'RGBa(0,0,100,0.5)';
                        C.strokeStyle = 'RGBa(0,0,100,1)'; 
                        C.translate(this.x(),this.y());
                        C.rotate(this.rotation());
                        C.fillRect(this.origin_x(),this.origin_y(),this.dimensions.width,this.dimensions.height);
                        C.strokeRect(this.origin_x(),this.origin_y(),this.dimensions.width,this.dimensions.height);
                        C.restore();
                        break;
                case 'circ':
                        C.save();
                        C.fillStyle = 'RGBa(0,0,100,0.5)';
                        C.strokeStyle = 'RGBa(0,0,100,1)'; 
                        C.translate(this.x(),this.y());
                        C.beginPath();
                        C.arc(this.origin_x(),this.origin_y(),this.dimensions.radius,0,Math.PI*2,true);
                        C.stroke();
                        C.fill();
                        C.closePath();
                        C.restore();
                        break;
                default:
                        break;
                }               
}

