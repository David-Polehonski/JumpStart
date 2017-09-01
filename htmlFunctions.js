/*
	HTML Helper functions, using a 'private' html Class.
*/
(function initHTMLFunctions (J) {
	'use strict';
	var JHTML = new J.Class();

	JHTML.prototype.init = function (htmlNode) {
		if (this.isHtml(htmlNode)){
			return new JHTMLNode(htmlNode);
		} else if (htmlNode instanceof window.NodeList || htmlNode instanceof window.HTMLCollection) {
			return new JHTMLCollection(htmlNode);
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
            if (node.dataset) {
                return node.dataset;
            } else {
                //Polyfill until supported.
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

	var getScrollX  = function (n) {
		var supportPageOffset = window.pageXOffset !== undefined;
		var isCSS1Compat = ((document.compatMode || "") === "CSS1Compat");

		return supportPageOffset ? window.pageXOffset : isCSS1Compat ? document.documentElement.scrollLeft : document.body.scrollLeft;
		var y = supportPageOffset ? window.pageYOffset : isCSS1Compat ? document.documentElement.scrollTop : document.body.scrollTop;
	};
	var getScrollY  = function (n) {
		var supportPageOffset = window.pageXOffset !== undefined;
		var isCSS1Compat = ((document.compatMode || "") === "CSS1Compat");

		return supportPageOffset ? window.pageYOffset : isCSS1Compat ? document.documentElement.scrollTop : document.body.scrollTop;
	};

	var JHTMLNode = new J.Class('JHTML Node').extend(JHTML);
	JHTMLNode.prototype.init = function (htmlNode) {
		this.node = htmlNode;
		return this;
	};

	var JHTMLCollection = new J.Class('JHTML Collection').extend(JHTML);
	JHTMLCollection.prototype.init = function (htmlNodeList) {
		this.collection = htmlNodeList;
		return this;
	};

	J.html = function (htmlNode) {
		return new JHTML(htmlNode);
	};
	
	J.html.getScrollX = getScrollX;
	J.html.getScrollY = getScrollY;

})(window.J || {});
