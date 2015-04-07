/*@Jrender.js
    Description: Jumpstart Module, template renderer engine.
*/
(function (J) {
    "use strict";
    
    var BIND = 'data-j-bind',
        ATTRIBUTE = 'data-j-attribute';
    // J.render accepts a template element, root node definition and a dataObject to use as a data context.
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    
    J.render = function (templateNode, dataObj, rootElement) {
        // Only Accepts HTML5 Templates.
        var i = 0,
            template = new J.Template(),
            dataElements,
            boundElements,
            dataAttributes;
        
        dataObj = (typeof dataObj === 'undefined') ? 'default' : dataObj;
        
        function bindData(elem) {
            var newNode, set;
            // If the element contains a data-bind attribute then insert data from the object dataObject.
            if (!!elem.getAttribute(BIND)) {
                switch (elem.nodeName) {
                case "INPUT":
                case "SELECT":
                    set = template.addBoundParameter(elem.getAttribute(BIND), elem);
                    set(template.evaluate(elem.getAttribute(BIND)));
                    break;
                default:
                    newNode = document.createTextNode(template.evaluate(elem.getAttribute(BIND)));
                    template.addBoundParameter(elem.getAttribute(BIND), elem.appendChild(newNode));
                    break;
                }
                
                return true;
            }
            return false;
        }
        
        function writeAttribute(elem) {
            var newAttrObj = {},
                data = J.getData(elem);
            
            if (!!data.jAttribute) {
                // The data attribute must exist.
                newAttrObj.name = data.jAttribute.split("=")[0];
                newAttrObj.value = data.jAttribute.split("=")[1];
            }
            if (template.requiresInterpolation(newAttrObj.value)) {
                newAttrObj.value = template.evaluateInterpolation(newAttrObj.value);
            }
            elem.setAttribute(newAttrObj.name, newAttrObj.value);
            elem.removeAttribute(ATTRIBUTE);
        }
                
        if (!templateNode.content) {
            template.setTemplateElement(templateNode);
        } else if (!templateNode.content.querySelector(rootElement)) {
            throw ("J.Render: Template doesn't contain specified rootElement " + rootElement);
        } else {
            // It's an HTML5 Template, import it's specified root node.
            template.setTemplateElement(document.importNode(templateNode.content.querySelector(rootElement), true));
        }
                
        template.setDataContext(dataObj);
        
        dataElements = template.templateElement.querySelectorAll("[" + BIND + "]");
        for (i; i < dataElements.length; i += 1) {
            bindData(dataElements[i]);
        }
        
        dataAttributes = template.templateElement.querySelectorAll("[" + ATTRIBUTE + "]");
        for (i = 0; i < dataAttributes.length; i += 1) {
            writeAttribute(dataAttributes[i]);
        }
        
        return template;
    };
    
    J.Template = new J.Class();
        
    J.Template.prototype.init = function (templateElement, dataContext) {
        this.nodes = {};
        this.setTemplateElement(templateElement);
        
        if (typeof dataContext !== "undefined") {
            this.setDataContext(dataContext);
        }
    };
    
    // Sets the template element.
    J.Template.prototype.setTemplateElement = function (templateElement) {
        this.templateElement = templateElement;
    };
    
    // Sets the template element.
    J.Template.prototype.setDataContext = function (dataContext) {
        // If the datacontext has been set before, update all bound params.
        var name;
        if (typeof this.dataContext !== "undefined") {
            // Now update the internal reference.
            this.dataContext = dataContext;
            for (name in this.nodes) {
                if (this.nodes.hasOwnProperty(name)) {
                    this['set' + capitalizeFirstLetter(name)](this.evaluate(name));
                }
            }
        } else {
            // Now update the internal reference.
            this.dataContext = dataContext;
        }
        
    };
    
    // Adds a data bound parameter with getters and setters to the template API.
    J.Template.prototype.addBoundParameter = function (name, node) {
        // Adds methods for manipulating an injected parameter.
        if (!this.templateElement.contains(node)) {
            throw ("J.Template must contain argument node " + node);
        }
        
        if (this.nodes[name] === undefined) {
            this.nodes[name] = node;
        }
        
        switch (node.nodeName) {
        case '#text':
            this["get" + capitalizeFirstLetter(name)] = function () {
                return this.getTextNode(name);
            };
            this["set" + capitalizeFirstLetter(name)] = function (newValue) {
                return this.setTextNode(name, newValue);
            };
            break;
        case "INPUT":
            this["get" + capitalizeFirstLetter(name)] = function () {
                return this.getInputNode(name);
            };
            this["set" + capitalizeFirstLetter(name)] = function (newValue) {
                return this.setInputNode(name, newValue);
            };
            break;
        case "SELECT": // These getters and setters are for bound values, not attributes or options.
            this["get" + capitalizeFirstLetter(name)] = function () {
                return this.getSelectNode(name);
            };
            this["set" + capitalizeFirstLetter(name)] = function (newValue) {
                return this.setSelectNode(name, newValue);
            };
            break;
        }
        return this["set" + capitalizeFirstLetter(name)].bind(this);
    };
    
    J.Template.prototype.evaluate = function (param, context) {
        // Test a parameter string and evaluate if it exists in the data context.
        var current;
        
        if (typeof context === "undefined") {
            context = this.dataContext;
        }
        
        param = param.split(".");
        current = param.shift();
        
        if (typeof context[current] !== "undefined") {
            switch (typeof context[current]) {
            case "function":
                return context[current]();
            case "object":
                return this.evaluate(param.join('.'), context[current]);
            default:
                return context[current];
            }
        }
    };
    J.Template.prototype.evaluateInterpolation = function (string) {
        var testExp = /(?:\{)([\D\W]+)(\})/;
        string = string.replace(testExp, this.dataContext[string.match(testExp)[1]]);
        return string;
    };
    J.Template.prototype.requiresInterpolation = function (string) {
        var testExp = /(?:\{)([\D\W]+)(\})/;
        if (testExp.test(string)) {
            return !!this.dataContext[string.match(testExp)[1]];
        }
    };
    
    // Default text node parameter binding functions.
    J.Template.prototype.getTextNode = function (name) {
        return this.nodes[name].textContent; // Return the string content of the text node containing the bound value.
    };
    J.Template.prototype.setTextNode = function (name, value) {
        value = (typeof value === 'undefined') ? '' : value;
        var newNode = document.createTextNode(value),
            tempParent = this.nodes[name].parentNode;
        
        tempParent.removeChild(this.nodes[name]);
        this.nodes[name] = tempParent.appendChild(newNode);
        return;
    };
    
    // I/O Functions for params bound to input elements.    
    J.Template.prototype.getInputNode = function (name) {
        return this.nodes[name].value; // Return the string content of the text node containing the bound value.
    };
    J.Template.prototype.setInputNode = function (name, value) {
        value = (typeof value === 'undefined') ? '' : value;
        this.nodes[name].value = value;
        return;
    };
    
    // I/O Functions for params bound to input elements.    
    J.Template.prototype.getSelectNode = function (name) {
        return this.nodes[name].options[this.nodes[name].selectedIndex].value; // Return the string content of the options node containing the bound value.
    };
    J.Template.prototype.setSelectNode = function (name, value) {
        var i = 0;
        value = (typeof value === 'undefined') ? '' : value;
        
        do {
            if (this.nodes[name].options[i].value === value) {
                this.nodes[name].selectedIndex = i;
                return;
            }
            i += 1; // Onto the next.
        } while (i < this.nodes[name].options.length);
        
        return;
    };
    
    
    J.Template.prototype.render = function (targetElement) {
        targetElement.appendChild(this.templateElement);
        return;
    };
    J.Template.prototype.remove = function () {
        this.templateElement.parentNode.removeChild(this.templateElement);
    };
}(window.J));