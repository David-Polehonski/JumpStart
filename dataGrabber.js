/*@dataGrabber.js
    Description: Data attribute polyfill
*/
(function (J) {
    "use strict";
    J.dataGrabber = new J.Class();
    // Singleton pattern.
    J.dataGrabber.instance = null;
    J.dataGrabber.prototype.init = function () {
        if (J.dataGrabber.instance === null) {
            J.dataGrabber.instance = this;
        }
        return J.dataGrabber.instance;
    };
    
    J.dataGrabber.prototype.getData = function (HTMLelement) {
        var a = 0, attribute, dataset = {}, pattern = /^data-[a-zA-Z]/i;
        if (this.isHtml(HTMLelement)) {
            if (HTMLelement.dataset) {
                return HTMLelement.dataset;
            } else {
                //Polyfill until supported.
                for (a; a < HTMLelement.attributes.length; a += 1) {
                    attribute = HTMLelement.attributes[a];
                    if (pattern.test(attribute.nodeName)) {
                        dataset[attribute.nodeName.substr(attribute.nodeName.indexOf('-') + 1)] = attribute.value;
                    }
                }
                return dataset;
            }
        }
        return null;
    };
    J.dataGrabber.prototype.isHtml = function (obj) {
        return (obj.nodeType === 1 && typeof (obj.innerHTML) !== undefined);
    };
    J.getData = function (htmlElement) {
        var dg = new J.dataGrabber();
        return J.dataGrabber.instance.getData(htmlElement);
    };
}(window.J));