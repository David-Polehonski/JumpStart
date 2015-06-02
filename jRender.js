/*@Jrender.js
    Description: Jumpstart Module, template renderer engine.
*/
(function (J) {
    "use strict";
    
    var BIND = 'data-j-bind',
        ATTRIBUTE = 'data-j-attribute',
        TARGET = 'data-j-target',
        JTemplateException = new J.Class();
    // J.render accepts a template element, root node definition and a dataObject to use as a data context.
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    
    JTemplateException.prototype = {
        "init": function (message, detail) {
            this.detail = {};
            this.message = '';
            
            if (!!message) {
                this.setMessage(message);
            }
            if (!!detail) {
                this.setDetail(detail);
            }
                    
            return this;
        },
        "setMessage": function (newMsg) {
            this.message = newMsg;
        },
        "setDetail": function (detailObj) {
            var detail = {
                'origin': 'J.Template'
            },  keyName;
            
            for (keyName in detailObj) {
                if (detailObj.hasOwnProperty(keyName) && !detail.hasOwnProperty(keyName)) {
                    detail[keyName] = detailObj[keyName];
                }
            }
            this.detail = detail;
        },
        "throwException": function () {
            window.console.log(this.detail);
            throw "J.Template Exception: " + this.message;
        }
    };
    
    J.render = function (templateNode, dataObj, rootElement) {
        // Only Accepts HTML5 Templates.
        var i = 0,
            template = new J.Template(),
            dataElements,
            boundElements,
            dataAttributes;
        
        dataObj = (typeof dataObj === "undefined") ? {} : dataObj; // Create a blank data context
        
        function bindData(elem) {
            var newNode, set;
            // If the element contains a data-bind attribute then insert data from the object dataObject.
            if (elem.hasAttribute(TARGET)) {
                set = template.addBoundParameter(elem.getAttribute(BIND), elem);
                set(template.evaluate(elem.getAttribute(BIND)));
                return true;
            }
            
            if (!!elem.getAttribute(BIND)) {
                switch (elem.nodeName) {
                case "INPUT":
                case "SELECT":
                    set = template.addBoundParameter(elem.getAttribute(BIND), elem);
                    if (!template.evaluate(elem.getAttribute(BIND))) {
                        set(elem.value);
                    } else {
                        set(template.evaluate(elem.getAttribute(BIND)));
                    }
                    break;
                default:
                    newNode = template.evaluate(elem.getAttribute(BIND));
                    
                    if (!template.evaluate(elem.getAttribute(BIND))) {
                        // If evaluation fails, scan the element for data.
                        if (elem.textContent !== "") {
                            newNode = elem.textContent;
                            elem.textContent = "";
                        }
                    }
                    newNode = document.createTextNode(newNode);
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
            // If they attribute already exists and the value wasn't interpolated.
            if (elem.hasAttribute(newAttrObj.name) && template.requiresInterpolation(newAttrObj.value)) {
                return;
            } else {
                elem.setAttribute(newAttrObj.name, newAttrObj.value);
                elem.removeAttribute(ATTRIBUTE);
                return;
            }
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
    
    J.Template.prototype.getter = function (name) {
        var i = 0;
        for (i; i < this.nodes[name].length; i += 1) {
            switch (this.nodes[name][i].nodeName) {
            case '#text':
                return this.getTextNode(this.nodes[name][i]);
            case "INPUT":
                return this.getInputNode(this.nodes[name][i]);
            case "SELECT": // These getters and setters are for bound values, not attributes or options.
                return this.getSelectNode(this.nodes[name][i]);
            }
        }
    };
    
    J.Template.prototype.setter = function (name, newValue) {
        var i = 0;
        for (i; i < this.nodes[name].length; i += 1) {
            
            if (!!this.nodes[name][i].hasAttribute && this.nodes[name][i].hasAttribute(TARGET)) {
                // Redirect binding to elements attribute instead.
                if (this.nodes[name][i].hasAttribute(this.nodes[name][i].getAttribute(TARGET))) {
                    this.setAttributeValue(this.nodes[name][i], this.nodes[name][i].getAttribute(TARGET), newValue);
                } else {
                    throw ("Missing bound attribute in TARGET directive. " + this.nodes[name][i].getAttribute(TARGET));
                }
            } else {
                // Switch through default node behaviours
                switch (this.nodes[name][i].nodeName) {
                case '#text':
                    this.setTextNode(this.nodes[name][i], newValue);
                    break;
                case "INPUT":
                    this.setInputNode(this.nodes[name][i], newValue);
                    break;
                case "SELECT": // These getters and setters are for bound values, not attributes or options.
                    this.setSelectNode(this.nodes[name][i], newValue);
                    break;
                }
            }
        }
    };
        
    // Adds a data bound parameter with getters and setters to the template API.
    J.Template.prototype.addBoundParameter = function (name, node) {
        // Adds methods for manipulating an injected parameter.
        if (!this.templateElement.contains(node)) {
            var e = new JTemplateException("J.Template must contain argument node", {
                'node': node,
                'element': this.templateElement
            });
            e.throwException();
        }
        
        if (this.nodes[name] === undefined) {
            this.nodes[name] = [node];
            
            this["get" + capitalizeFirstLetter(name)] = function () {
                return this.getter(name);
            };
            this["set" + capitalizeFirstLetter(name)] = function (newValue) {
                return this.setter(name, newValue);
            };
            
        } else {
            this.nodes[name].push(node);
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
        
        if (context.hasOwnProperty(current)) {
            switch (typeof context[current]) {
            case "function":
                return context[current]();
            case "object":
                return this.evaluate(param.join('.'), context[current]);
            default:
                if (typeof context[current] !== "undefined") {
                    return context[current];
                } else {
                    return false;
                }
            }
        }
    };
    
    J.Template.prototype.evaluateInterpolation = function (string) {
        var testExp = /(?:\{)([\D\W\.]+)(\})/,
            value = this.evaluate(string.match(testExp)[1]);
        
        if (!!value) {
            string = string.replace(testExp, value);
        }
        
        return string;
    };
    J.Template.prototype.requiresInterpolation = function (string) {
        var testExp = /(?:\{)([\D\W\.]+)(\})/;
        return !!testExp.test(string);
    };
    
    // Default text node parameter binding functions.
    J.Template.prototype.getTextNode = function (node) {
        return node.nodeValue; // Return the string content of the text node containing the bound value.
    };
    J.Template.prototype.setTextNode = function (node, value) {
        value = (typeof value === 'undefined') ? '' : value;
        node.nodeValue = value;
        return;
    };
    
    // I/O Functions for params bound to input elements.    
    J.Template.prototype.getInputNode = function (node) {
        return node.value; // Return the string content of the text node containing the bound value.
    };
    J.Template.prototype.setInputNode = function (node, value) {
        value = (typeof value === 'undefined') ? '' : value;
        node.value = value;
        return;
    };
    
    // I/O Functions for params bound to input elements.    
    J.Template.prototype.getSelectNode = function (node) {
        return node.options[node.selectedIndex].value; // Return the string content of the options node containing the bound value.
    };
    J.Template.prototype.setSelectNode = function (node, value) {
        var i = 0;
        value = (typeof value === 'undefined') ? '' : value;
        
        do {
            if (node.options[i].value === value) {
                node.selectedIndex = i;
                return;
            }
            i += 1; // Onto the next.
        } while (i < node.options.length);
        
        return;
    };
    
    J.Template.prototype.setAttributeValue = function (node, attrName, value) {
        node.setAttribute(attrName, value);
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