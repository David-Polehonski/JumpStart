(function(nameSpace)
{
	var Start,
		n = nameSpace || {};
	//	Class() - syntactic sugar function.
	n.Class = function()
	{
		"use strict";
		// Create a 
		var _;
		(_ = (function()
		{
			"use strict";
			
			if(arguments.length > 0)
			{
				this.init.apply(this,arguments);
			}else{
				this.init();
			}
						
		})).prototype = {
			'init':function(){},
			'toString':function(){return 'Class';}				
		}
		_.extend = function(o)
		{
			"use strict";
			//Create empty constructor.
			var temporary = function(){};
			//Assign target prototype by reference.
			temporary.prototype = o.prototype;
			//Inherit prototype via the temporary constructor.
			this.prototype = new temporary();
			//Save the parent prototype's init method.
			this.prototype.parent = o.prototype;			
			return this;
		}
		return _;
	}
		
	//n.Jboxes = [];
	n.Main = function(){};
	
    var Jboxes = [];
    n.JumpStart = function(obj){
        Jboxes.push(obj);
    }
    
	Start = function(e) 
	{
		var i = 0, l = Jboxes.length;
        
		for (i; i< l; i+=1){
			//   If it contains a Jump() then Jumpstart it.
            if(Jboxes[i].Jump){
                Jboxes[i].Jump(n);
            }
            //  If it contains a 'name' then register it.
            if(Jboxes[i].name){
                n[Jboxes[i].name] = Jboxes[i];
            }
		}
		n.Main();
	}
		
	if(window.addEventListener){	
		window.addEventListener('load',function(e){Start(e);},false);
	}else{
		window.attachEvent('onload',function(e){"use strict"; var E = e || window.event; Start(E);});
	}
    
	return n;
})(window.J = window.J || {})