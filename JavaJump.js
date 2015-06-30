(function (nameSpace) {
    "use strict";
	var n = nameSpace || {},
        Jboxes = [];
	//	Class() - syntactic sugar function.
	n.Class = function () {
		// Create a variable 
		var a;
		(a = function () {
			if (arguments.length > 0) {
				return this.init.apply(this, arguments) || this;
			} else {
				return this.init() || this;
			}
		}).prototype = {
			'init': function () {},
			'toString': function () {return 'Class'; }
		};
		a.extend = function (o) {
			//Create empty constructor.
			var Temporary = function () {};
			//Assign target prototype by reference.
			Temporary.prototype = o.prototype;
			//Inherit prototype via the temporary constructor.
			this.prototype = new Temporary();
			//Save the parent prototype's init method.
			this.prototype.parent = o.prototype;
			return this;
		};
		return a;
	};
	
	n.Main = function () {};
	
    n.JumpStart = function (obj) {
        Jboxes.push(obj);
    };
    
    function s(e) {
		var i = 0, l = Jboxes.length;
        
		for (i; i < l; i += 1) {
			//   If it contains a Jump() then Jumpstart it.
            if (Jboxes[i].Jump) {
                Jboxes[i].Jump(n);
            }
            //  If it contains a 'name' then register it.
            if (Jboxes[i].name) {
                n[Jboxes[i].name] = Jboxes[i];
            }
		}
		n.Main(n);
	}
		
	if (window.addEventListener) {
		window.addEventListener('load', function (e) { s(e); }, false);
	} else {
		window.attachEvent('onload', function (e) { var E = e || window.event; s(E); });
	}
    
	return n;
}(window.J = window.J || {}));