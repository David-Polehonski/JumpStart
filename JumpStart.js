(function (nameSpace) {
    "use strict";
	var n = nameSpace || {},
        j = [],
		vars = {};

	vars.rootPath = function () {
		if (!!document.currentScript) {
			return document.currentScript.src;
		} else {
			return function () {
				//	Calculate root path by reading the last rendered script block from the page.
				var scripts = document.getElementsByTagName('script');
				return scripts[scripts.length-1].src;
			}();
		}
	}().replace(/\/[a-zA-Z]+\.js$/, '/');

	//	Class() - syntactic sugar function.
	n.Class = function (className) {
		// Create a variable
		var a;
		var thisClassName = className || 'jClass undefined';
		(a = function () {
			if (arguments.length > 0) {
				return this.init.apply(this, arguments) || this;
			} else {
				return this.init() || this;
			}
		}).prototype = {
			'init': function () {},
			'toString': function () {return thisClassName; }
		};
		//Create empty constructor.
		a.extend = function (o) {
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
        } else {
			throw('Invalid Javascript object, cannot invoke module');
		}
    };

	n.value = function (varName) {
		if (typeof vars[varName] !== 'undefined') {
			return vars[varName];
		}
		return null;
	};

	n.require = function(libraryFileName){
		if(!document.querySelector("[src$='/" + libraryFileName + "']")){
			n.log("Using require is discourage in production due to detrimental performance impact.","warning");
			document.write('<script src="' + J.value('rootPath') + '/' + libraryFileName + '"><\/script>');
		}
		return;
	}

	n.log = function(obj, severity){
		var severe = severity || 'info';

		if(!!console && !!console.log){
			var consoleOptions = {
				'info': console.log
			};

			consoleOptions.warning = !!console.warn ?
				console.warn : consoleOptions.info;
			consoleOptions.error = (!!console.error) ?
				console.error : consoleOptions.warning;

			consoleOptions[severe].bind(console, obj).call();
		}
	}

    function s(e) {
		var i = 0, l = j.length;

		for (i; i < l; i += 1) {
			j[i] = new j[i](n);
        }
		n.Main(n);
	}

	if (!!window.addEventListener) {
		window.addEventListener('load', function (e) { s(e); }, false);
	} else {
		window.attachEvent('onload', function (e) { var E = e || window.event; s(E); });
	}

	return n;
}(window.J = window.J || {}));
