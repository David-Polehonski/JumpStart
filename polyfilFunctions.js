/*	@polyfilFunctions

	Conditional polyfils for a several useful functions across several JS areas
*/
//	ARRAY
//	Array.indexOf
if (!Array.prototype.indexOf) {
	Array.prototype.indexOf = function (searchElement, fromIndex) {
		if ( this === undefined || this === null ) {
			throw new TypeError( '"this" is null or not defined' );
		}

		var length = this.length >>> 0; // Hack to convert object.length to a UInt32

		fromIndex = +fromIndex || 0;

		if (Math.abs(fromIndex) === Infinity) {
			fromIndex = 0;
		}

		if (fromIndex < 0) {
			fromIndex += length;
			if (fromIndex < 0) {
				fromIndex = 0;
			}
		}

		for (;fromIndex < length; fromIndex++) {
			if (this[fromIndex] === searchElement) {
				return fromIndex;
			}
		}
		return -1;
	};
}
//	Array.forEach
if (!Array.prototype.forEach) {
	Array.prototype.forEach = function(callback, thisArg) {

		var T, k;

		if (this === null) {
			throw new TypeError(' this is null or not defined');
		}

		// 1. Let O be the result of calling toObject() passing the
		// |this| value as the argument.
		var O = Object(this);

		// 2. Let lenValue be the result of calling the Get() internal
		// method of O with the argument "length".
		// 3. Let len be toUint32(lenValue).
		var len = O.length >>> 0;


		if (typeof callback !== "function") {
			throw new TypeError(callback + ' is not a function');
		}

		// 5. If thisArg was supplied, let T be thisArg; else let
		// T be undefined.
		if (arguments.length > 1) {
			T = thisArg;
		}

		// 6. Let k be 0
		k = 0;

		// 7. Repeat, while k < len
		while (k < len) {

			var kValue;

			// a. Let Pk be ToString(k).
			//    This is implicit for LHS operands of the in operator
			// b. Let kPresent be the result of calling the HasProperty
			//    internal method of O with argument Pk.
			//    This step can be combined with c
			// c. If kPresent is true, then
			if (k in O) {

				// i. Let kValue be the result of calling the Get internal
				// method of O with argument Pk.
				kValue = O[k];

				// ii. Call the Call internal method of callback with T as
				// the this value and argument list containing kValue, k, and O.
				callback.call(T, kValue, k, O);
			}
			// d. Increase k by 1.
			k++;
		}
		// 8. return undefined
	};
}
//	Array.find
if (!Array.prototype.find) {
	Object.defineProperty(Array.prototype, 'find', {
		value: function(predicate) {
			// 1. Let O be ? ToObject(this value).
			if (this == null) {
				throw new TypeError('"this" is null or not defined');
			}

			var o = Object(this);

			// 2. Let len be ? ToLength(? Get(O, "length")).
			var len = o.length >>> 0;

			// 3. If IsCallable(predicate) is false, throw a TypeError exception.
			if (typeof predicate !== 'function') {
				throw new TypeError('predicate must be a function');
			}

			// 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
			var thisArg = arguments[1];

			// 5. Let k be 0.
			var k = 0;

			// 6. Repeat, while k < len
			while (k < len) {
				// a. Let Pk be ! ToString(k).
				// b. Let kValue be ? Get(O, Pk).
				// c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
				// d. If testResult is true, return kValue.
				var kValue = o[k];
				if (predicate.call(thisArg, kValue, k, o)) {
					return kValue;
				}
				// e. Increase k by 1.
				k++;
			}

			// 7. Return undefined.
			return undefined;
		}
	});
}

//	DATE
//	Date.now
if (!Date.now) {
	Date.now = function now () {
		return new Date().getTime();
	}
}

//	FUNCTION
// 	Function.bind
if (!Function.prototype.bind) {
	Function.prototype.bind = function (oThis) {
		if (typeof this !== "function") {
			// closest thing possible to the ECMAScript 5 internal IsCallable function
			throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
		}

		var aArgs = Array.prototype.slice.call(arguments, 1),
				fToBind = this,
				fNOP = function () {},
				fBound = function () {
					return fToBind.apply(
						this instanceof fNOP && oThis ? this : oThis,
						aArgs.concat(Array.prototype.slice.call(arguments))
					);
				};

		fNOP.prototype = this.prototype;
		fBound.prototype = new fNOP();

		return fBound;
	};
}

//	NODE
//	Node.contains
if(!document.createDocumentFragment().contains) {
	Node.prototype.contains = function contains(node) {
		if (!(0 in arguments)) {
			throw new TypeError('1 argument is required');
		}

		do {
			if (this === node) {
				return true;
			}
		} while (node = node && node.parentNode);

		return false;
	};
}

if(!'isConnected' in Node.prototype) {
	Object.defineProperty(
		Node.prototype,
		'isConnected',
		{
			get: function () { return document.body.contains(this) }
		}
	);
}

//	ES6
//	ES6.Promises
if(!Window.Promise) {
	(function(root) {

		// Store setTimeout reference so promise-polyfill will be unaffected by
		// other code modifying setTimeout (like sinon.useFakeTimers())
		var setTimeoutFunc = setTimeout;

		function noop() {}

		// Use polyfill for setImmediate for performance gains
		var asap = (typeof setImmediate === 'function' && setImmediate) ||
			function(fn) { setTimeoutFunc(fn, 1); };

		// Polyfill for Function.prototype.bind
		function bind(fn, thisArg) {
			return function() {
				fn.apply(thisArg, arguments);
			};
		}

		var isArray = Array.isArray || function(value) {
			return Object.prototype.toString.call(value) === "[object Array]";
		};

		function Promise(fn) {
			if (typeof this !== 'object') throw new TypeError('Promises must be constructed via new');
			if (typeof fn !== 'function') throw new TypeError('not a function');
			this._state = 0;
			this._value = undefined;
			this._deferreds = [];

			doResolve(fn, this);
		}

		function handle(self, deferred) {
			while (self._state === 3) {
				self = self._value;
			}
			if (self._state === 0) {
				self._deferreds.push(deferred);
				return;
			}
			asap(function() {
				var cb = self._state === 1 ? deferred.onFulfilled : deferred.onRejected;
				if (cb === null) {
					(self._state === 1 ? resolve : reject)(deferred.promise, self._value);
					return;
				}
				var ret;
				try {
					ret = cb(self._value);
				} catch (e) {
					reject(deferred.promise, e);
					return;
				}
				resolve(deferred.promise, ret);
			});
		}

		function resolve(self, newValue) {
			try { //Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
				if (newValue === self) throw new TypeError('A promise cannot be resolved with itself.');
				if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
					var then = newValue.then;
					if (newValue instanceof Promise) {
						self._state = 3;
						self._value = newValue;
						finale(self);
						return;
					} else if (typeof then === 'function') {
						doResolve(bind(then, newValue), self);
						return;
					}
				}
				self._state = 1;
				self._value = newValue;
				finale(self);
			} catch (e) { reject(self, e); }
		}

		function reject(self, newValue) {
			self._state = 2;
			self._value = newValue;
			finale(self);
		}

		function finale(self) {
			for (var i = 0, len = self._deferreds.length; i < len; i++) {
				handle(self, self._deferreds[i]);
			}
			self._deferreds = null;
		}

		function Handler(onFulfilled, onRejected, promise){
			this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
			this.onRejected = typeof onRejected === 'function' ? onRejected : null;
			this.promise = promise;
		}

		/**
		 * Take a potentially misbehaving resolver function and make sure
		 * onFulfilled and onRejected are only called once.
		 *
		 * Makes no guarantees about asynchrony.
		 */
		function doResolve(fn, self) {
			var done = false;
			try {
				fn(function (value) {
					if (done) return;
					done = true;
					resolve(self, value);
				}, function (reason) {
					if (done) return;
					done = true;
					reject(self, reason);
				});
			} catch (ex) {
				if (done) return;
				done = true;
				reject(self, ex);
			}
		}

		Promise.prototype['catch'] = function (onRejected) {
			return this.then(null, onRejected);
		};

		Promise.prototype.then = function(onFulfilled, onRejected) {
			var prom = new Promise(noop);
			handle(this, new Handler(onFulfilled, onRejected, prom));
			return prom;
		};

		Promise.all = function () {
			var args = Array.prototype.slice.call(arguments.length === 1 && isArray(arguments[0]) ? arguments[0] : arguments);

			return new Promise(function (resolve, reject) {
				if (args.length === 0) return resolve([]);
				var remaining = args.length;
				function res(i, val) {
					try {
						if (val && (typeof val === 'object' || typeof val === 'function')) {
							var then = val.then;
							if (typeof then === 'function') {
								then.call(val, function (val) { res(i, val); }, reject);
								return;
							}
						}
						args[i] = val;
						if (--remaining === 0) {
							resolve(args);
						}
					} catch (ex) {
						reject(ex);
					}
				}
				for (var i = 0; i < args.length; i++) {
					res(i, args[i]);
				}
			});
		};

		Promise.resolve = function (value) {
			if (value && typeof value === 'object' && value.constructor === Promise) {
				return value;
			}

			return new Promise(function (resolve) {
				resolve(value);
			});
		};

		Promise.reject = function (value) {
			return new Promise(function (resolve, reject) {
				reject(value);
			});
		};

		Promise.race = function (values) {
			return new Promise(function (resolve, reject) {
				for(var i = 0, len = values.length; i < len; i++) {
					values[i].then(resolve, reject);
				}
			});
		};

		/**
		 * Set the immediate function to execute callbacks
		 * @param fn {function} Function to execute
		 * @private
		 */
		Promise._setImmediateFn = function _setImmediateFn(fn) {
			asap = fn;
		};

		if (typeof module !== 'undefined' && module.exports) {
			module.exports = Promise;
		} else if (!root.Promise) {
			root.Promise = Promise;
		}

	})(this);
}
