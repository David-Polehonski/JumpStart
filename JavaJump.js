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
			'toString':function(){return 'Class';},
			'extend':function(o)
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
			},
			'accessors':function(varName)
			{
				this[varName] = this[varName] || '';
				this.getter(varName);
				this.setter(varName);
			},
			'getter':function(varName)
			{
				this[varName] = this[varName] || '';
				this["get" + varName.charAt(0).toUpperCase() + varName.slice(1)] = function()
				{
					return this[varName];
				}
			},
			'setter':function(varName)
			{
				this[varName] = this[varName] || '';
				this["set" + varName.charAt(0).toUpperCase() + varName.slice(1)] = function(value)
				{
					this[varName] = value;
					return;
				}
			}		
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