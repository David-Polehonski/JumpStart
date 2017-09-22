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
		try {
			Object.defineProperty(a, "name", { value: thisClassName });
		} catch (e) {
			J.log("warn", 'Cannot define name on Class');
		}
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

	function addScript (path, _async) {
		var script = document.createElement('script');
		script.src = path;
		script.async = !!_async;

		document.head.appendChild(script);
	}

	n.require = function(jsFileName){
		if (jsFileName.indexOf('/') === -1) {
			n.log("Importing jumpStart." + jsFileName + ".");
			if(!document.querySelector("[src$='/" + jsFileName + "']")) {
				addScript(J.value('rootPath') + '/' + jsFileName);
			} else {
				n.log("Internal File." + jsFileName + " has already been imported.","warning");
			}
		} else {
			n.log("Importing external." + jsFileName + ".");
			if(!document.querySelector("[src='" + jsFileName + "']")) {
				addScript(jsFileName);
			} else {
				n.log("External File." + jsFileName + " has already been imported.","warning");
			}
		}
		return;
	};

	n.include = function(jsFileName){
		if (jsFileName.indexOf('/') === -1) {
			n.log("Importing jumpStart." + jsFileName + ".");
			if(!document.querySelector("[src$='/" + jsFileName + "']")) {
				addScript(J.value('rootPath') + '/' + jsFileName, true);
			} else {
				n.log("Internal File." + jsFileName + " has already been imported.","warning");
			}
		} else {
			n.log("Importing external." + jsFileName + ".");
			if(!document.querySelector("[src='" + jsFileName + "']")) {
				addScript(jsFileName, true);
			} else {
				n.log("External File." + jsFileName + " has already been imported.","warning");
			}
		}
		return;
	};

	n.export = function(moduleName, moduleObject){
		if (!!moduleObject && (typeof moduleObject === "function" || typeof moduleObject === "object") ) {
			k[moduleName] = moduleObject;
		}
	};

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
