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
			
			delete this.private;
						
		})).prototype = {
			'init':function(){},
			'toString':function(){return 'Class';},
			'accessors':function(varName)
			{
				this.getter(varName);
				this.setter(varName);
			},
			'getter':function(varName)
			{
				var local;
				
				this.private = this.private || {};
				this.private[varName] = this.private[varName] || null;
				
				local = this.private;
				
				this["get" + varName.charAt(0).toUpperCase() + varName.slice(1)] = function()
				{
					return local[varName];
				}
			},
			'setter':function(varName)
			{
				var local;
				
				this.private = this.private || {};
				this.private[varName] = this.private[varName] || null;
				
				local = this.private;
				
				this["set" + varName.charAt(0).toUpperCase() + varName.slice(1)] = function(value)
				{
					local[varName] = value;
					return;
				}
			}		
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
		
	n.Jboxes = [];
	n.Main = function(){};
	
	Start = function(e) 
	{
		var i = 0,
			l = n.Jboxes.length;
		for (i; i< l; i+=1){
			n.Jboxes[i].Jump();	
			n[n.Jboxes[i].name] = n.Jboxes[i];
		}
		n.Main();
	}
		
	if(window.addEventListener){	
		window.addEventListener('load',function(e){Start(e);},false);
	}else{
		window.onload = function(e){
			"use strict";
			var E = e || window.event;
			Start(E);
		}
	}
	return n;
})(window.J = window.J || {})