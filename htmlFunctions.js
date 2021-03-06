/*
	HTML Helper functions, using a 'private' html Class.
*/
(function initHTMLFunctions (J) {
	'use strict';
	var JHTML = J.Class("JHTML");

	JHTML.prototype.init = function (html_nodeOrCollection) {
		if (this.isHtml(html_nodeOrCollection)){
			return new JHTMLNode(html_nodeOrCollection);
		} else if (html_nodeOrCollection instanceof window.NodeList || html_nodeOrCollection instanceof window.HTMLCollection) {
			return new JHTMLCollection(html_nodeOrCollection);
		}
		return null;
	};

	JHTML.prototype.isHtml = function (n) {
		var node = n || this.node;
		return (node.nodeType === 1 && typeof (node.innerHTML) !== undefined);
	};

	JHTML.prototype.getDataSet = function (n) {
		var a = 0, attribute, dataset = {}, pattern = /^data-[a-zA-Z]/i, node = n || this.node;
		if (this.isHtml(node)) {
			if (!!node.dataset) {
				return node.dataset;
			} else {
				// Polyfill until supported.
				for (a; a < node.attributes.length; a += 1) {
					attribute = node.attributes[a];
					if (pattern.test(attribute.nodeName)) {
						dataset[attribute.nodeName.substr(attribute.nodeName.indexOf('-') + 1)] = attribute.value;
					}
				}
				return dataset;
			}
		}
		return null;
	};

	JHTML.prototype.getClassList = function (n) {
		var node = n || this.node;
		if (this.isHtml(node)) {
			if (!!node.classList) {
				return node.classList;
			} else {
				J.log('Class Lists not support in this browser','warning');
			}
		} else {
			J.log('Passed object is not an HTML node','warning');
		}
		return null;
	};

	JHTML.prototype.getTemplateContent = function (n) {
		var node = n || this.node;
		if(!!node.content) {
			return document.importNode(node.content, true);
		} else {
			var fragment = document.createDocumentFragment();
			var childcount = node.childNodes.length;

			for(var i = 0; i < childcount; i++) {
				fragment.appendChild( node.childNodes[i].cloneNode(true) );
			}
			return fragment;
		}
	}

	var JHTMLNode = J.Class('JHTMLNode').extend(JHTML);
	JHTMLNode.prototype.init = function (htmlNode) {
		this.node = htmlNode;

		if (!this.node.dataset) {
			Object.defineProperty(this, 'dataset', {
				get: (function () { return JHTML.getDataSet(this.node) }).bind(this)
			});
		}

		if (!this.node.classList) {
			Object.defineProperty(this, 'classList', {
				get: (function () { return JHTML.getClassList(this.node) }).bind(this)
			});
		}

		return this;
	};

	var JHTMLCollection = J.Class('JHTMLCollection').extend(JHTML);
	JHTMLCollection.prototype.init = function (htmlNodeList) {
		this.collection = htmlNodeList;
		return this;
	};

	J.html = function (htmlNode) {
		return new JHTML(htmlNode);
	};

	var getScrollX  = function (n) {
		var supportPageOffset = window.pageXOffset !== undefined;
		var isCSS1Compat = ((document.compatMode || "") === "CSS1Compat");

		return supportPageOffset ? window.pageXOffset : isCSS1Compat ? document.documentElement.scrollLeft : document.body.scrollLeft;
	};

	var getScrollY  = function (n) {
		var supportPageOffset = window.pageXOffset !== undefined;
		var isCSS1Compat = ((document.compatMode || "") === "CSS1Compat");

		return supportPageOffset ? window.pageYOffset : isCSS1Compat ? document.documentElement.scrollTop : document.body.scrollTop;
	};

	if (!window.hasOwnProperty('scrollX') || !window.hasOwnProperty('scrollY')) {
		Object.defineProperty(window, 'scrollX', {
			get: function () { return getScrollX() }
		});
		Object.defineProperty(window, 'scrollY', {
			get: function () { return getScrollY() }
		});
	}

})(window.J || {});
