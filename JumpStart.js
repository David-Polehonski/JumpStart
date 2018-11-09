(function (nameSpace) {
	"use strict";
	var n = nameSpace || {},
			j = [],
			k = {},
			vars = {};

	vars.rootPath = function () {
		if (!!document.currentScript && !!document.currentScript.src) {
			return document.currentScript.src;
		} else {
			//	Calculate root path by reading the last rendered script block from the page.
			var ss = document.getElementsByTagName('script');
			if (!!ss[ss.length-1].src) {
				return ss[ss.length-1].src;
			} else if (!!ss[ss.length-1].dataset.path) {
				return ss[ss.length-1].dataset.path;
			} else {
				return '/';
			}
		}
	}().replace(/(?:\/minified)?\/[a-zA-Z]+\.js$/, '');

	//	Class() - syntactic sugar function.
	n.Class = function (className) {
		// Create a variable
		var a;
		var thisClassName = className || 'jClass';
		a = function jClass () {
			if (arguments.length > 0) {
				return this.init.apply(this, arguments) || this;
			} else {
				return this.init() || this;
			}
		};

		try {
			Object.defineProperty(a, 'name', { 'value': thisClassName });
		} catch (e) {
			a = new Function('return ' + a.toString().replace('jClass', thisClassName) + ';'  )();
		}

		a.prototype = {
			'init': function () {},
			'toString': function () { return this.name; }
		};
		//Create empty constructor.
		a.extend = function (o) {
			if (!Object.create) {
				var Temporary = function () {};
				//Assign target prototype by reference.
				Temporary.prototype = o.prototype;
				//Inherit prototype via the temporary constructor.
				this.prototype = new Temporary();
			} else {
				this.prototype = Object.create(o.prototype);
			}
			this.prototype.constructor = a;
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

	n.set = function (varName, varValue) {
		vars[varName] = varValue;
	};
	n.get = function (varName) {
		if (typeof vars[varName] !== 'undefined') {
			return vars[varName];
		}
		return null;
	};

	//	Note to self: REQUIRE = async false, execute the scripts in the order you request them ASAP but not before parsing completes.
	//	Note to self: INCLUDE = async true, execute the scripts as and when they arrive don't worry about order.
	//	Node to self: Calling either REQUIRE or INCLUDE after DOMContentLoaded event have identical results.

	function addScript (path, _async) {
		var script = document.createElement('script');
		script.src = path;
		script.async = !!_async;

		return document.head.appendChild(script);
	}

	n.require = function(jsFileName){
		if (jsFileName.indexOf('/') === -1) {
			n.log("Importing jumpStart." + jsFileName + ".");
			return new Promise( function(resolve) {
				if(!document.querySelector("[src$='/" + jsFileName + "']")) {
					addScript(J.get('rootPath') + '/' + jsFileName).addEventListener('load', resolve, false);
				} else {
					n.log("Internal File." + jsFileName + " has already been imported.","warning");
					resolve();
				}
			});
		} else {
			n.log("Importing external." + jsFileName + ".");
			return new Promise( function(resolve) {
				if(!document.querySelector("[src='" + jsFileName + "']")) {
					addScript(jsFileName).addEventListener('load', resolve, false);
				} else {
					n.log("External File." + jsFileName + " has already been imported.","warning");
					resolve();
				}
			});
		}
	};

	n.include = function(jsFileName){
		if (jsFileName.indexOf('/') === -1) {
			n.log("Importing jumpStart." + jsFileName + ".");
			return new Promise( function(resolve) {
				if(!document.querySelector("[src$='/" + jsFileName + "']")) {
					addScript(J.get('rootPath') + '/' + jsFileName).addEventListener('load', resolve, true);
				} else {
					n.log("Internal File." + jsFileName + " has already been imported.","warning");
					resolve();
				}
			});
		} else {
			n.log("Importing external." + jsFileName + ".");
			return new Promise( function(resolve) {
				if(!document.querySelector("[src='" + jsFileName + "']")) {
					addScript(jsFileName, true).addEventListener('load', resolve, true);
				} else {
					n.log("External File." + jsFileName + " has already been imported.","warning");
					resolve();
				}
			});
		}
	};

	n.export = function(moduleName, moduleObject){
		if (!!moduleObject && (typeof moduleObject === "function" || typeof moduleObject === "object") ) {
			k[moduleName] = moduleObject;
		} else {
			n.log('Cannot export ' + moduleName + ' as it is not a valid function or object');
		}
	};

	n.import = function(moduleName){
		if (!!moduleName && !!k[moduleName] ) {
			return k[moduleName];
		}
	};

	n.log = function(obj, severity){
		var severe = severity || 'info';

		if(!!console && !!console.log) {
			var consoleOptions = {
				'info': console.log,
				'warning': !!console.warn ? console.warn : console.log,
				'error': !!console.error ? console.error : console.log
			};

			consoleOptions[severe].bind(console, obj).call();
		}
	};

	function s(e) {
		var i = 0, l = j.length;

		for (i; i < l; i += 1) {
			if (!!j[i].name){
				k[j[i].name] = new j[i](n,k);
			} else {
				new j[i](n,k);
			}
		}
		n.Main(n,k);
	}

	if (!!window.addEventListener) {
		window.addEventListener('load', function (e) { s(e); }, false);
	} else {
		window.attachEvent('onload', function (e) { var E = e || window.event; s(E); });
	}

	return n;
}(window.J = window.J || {}));
