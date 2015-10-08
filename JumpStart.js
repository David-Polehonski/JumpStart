(function (nameSpace) {
    "use strict";
	var n = nameSpace || {},
        j = [];
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

    n.jumpStart = function (f) {
        if (!!f && typeof f === "function") {
            j.push(f);
        }
    };

    function s(e) {
		var i = 0, l = j.length;

		for (i; i < l; i += 1) {
			j[i] = new j[i](n);
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
