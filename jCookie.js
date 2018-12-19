(function (J) {
	'use strict';

	function parseCookieString() {
		var cookieJar = {};
		document.cookie.split(';').map(function (cookieString) { return cookieString.split('='); }).forEach(function(cookieArray) {
			if (!cookieJar.hasOwnProperty(cookieArray[0].trim())){
				Object.defineProperty(cookieJar, cookieArray[0].trim(), {
					'value': cookieArray[1].trim(),
					'configurable': false
				});
			}
		});
		return cookieJar;
	}

	function readCookie (cookieName) {
		var cookieJar = parseCookieString();
		return cookieJar[cookieName] || null;
	}

	var DEFAULT_ATTRIBUTES = {
		'max-age': 60*60*24,
		'path': '/',
		'domain': window.location.host
	};

	function writeCookie (cookieName, cookieValue, cookieAttributes) {
		var params = J.object(DEFAULT_ATTRIBUTES).mergeWith(cookieAttributes || {}, true);
		var cookie = [[cookieName,cookieValue].join('=')];

		for (var key in params) {
			cookie.push( [key,params[key]].join('=') );
		}

		document.cookie = cookie.join(';');
	}

	var Cookie = J.Class('Cookie');
	
	Cookie.prototype.init = function (str_cookieName) {
		Object.defineProperty(this, 'name', {
			'value': str_cookieName,
			'writable': false,
			'configurable': false
		});

		this.attributes = {};
		var writeCookieWithAttributes = function (cookieName, cookieValue) {
			writeCookie( cookieName, cookieValue, this.attributes );
		};
		
		Object.defineProperty(this, 'value', {
			'get': readCookie.bind(this, this.name),
			'set': writeCookieWithAttributes.bind(this, this.name)
		});
	};


	J.cookie = function (str_cookieName) {
		return new Cookie(str_cookieName);
	};
}(window.J || {}));