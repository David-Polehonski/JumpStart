/*
	HTML Helper functions, using a 'private' html Class.
*/
(function initHTMLFunctions (J) {
	'use strict';
	var JHTML = new J.Class();

	JHTML.prototype.init = function (htmlNode) {
		this.node = htmlNode;
		return this;
	};

	JHTML.prototype.isHtml = function () {
        return (this.node.nodeType === 1 && typeof (this.node.innerHTML) !== undefined);
    };

	JHTML.prototype.getDataSet = function () {
        var a = 0, attribute, dataset = {}, pattern = /^data-[a-zA-Z]/i;
        if (this.isHtml()) {
            if (this.node.dataset) {
                return this.node.dataset;
            } else {
                //Polyfill until supported.
                for (a; a < this.node.attributes.length; a += 1) {
                    attribute = this.node.attributes[a];
                    if (pattern.test(attribute.nodeName)) {
                        dataset[attribute.nodeName.substr(attribute.nodeName.indexOf('-') + 1)] = attribute.value;
                    }
                }
                return dataset;
            }
        }
        return null;
    };

	J.html = function (htmlNode) {
		return new JHTML(htmlNode);
	};
})(window.J || {});
