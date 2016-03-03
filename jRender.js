/*@Jrender.js
    Description: Jumpstart Module, template renderer engine.
*/
J.require('objectFunctions.js');
J.require('polyfilFunctions.js');
(function (J) {
    //"use strict";

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

	var JTemplateField = new J.Class();
	JTemplateField.prototype.formula = null;

	JTemplateField.prototype.init = function (fieldName, fieldValue, template, formula){
		this.template = template;

		this.fieldName = fieldName;
		this.fieldValue = fieldValue;

		this.formula = formula;
		return this;
	}

	JTemplateField.prototype.set = function (newValue){
		if (!this.formula === null){
			newValue = this.template.evaluate
		}
	}

	JTemplateField.prototype.get = function (){

	}


    J.render = function (templateNode, newModel, rootElement) {
        // Only Accepts HTML5 Templates.
        var i = 0,
		    template,
            dataElements,
            boundElements,
            dataAttributes,
			model = (typeof newModel === "undefined") ? {} : J.object(newModel).clone(); // Create a blank data context

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
                    newNodeValue = template.evaluate(elem.getAttribute(BIND));

                    if (newNodeValue === false && elem.textContent !== "") {
                        newNodeValue = elem.textContent;
                        elem.textContent = "";
                    } else if(newNodeValue === false ){
						newNodeValue = "";
					}

                    newNode = document.createTextNode(newNodeValue);
                    template.addBoundParameter(elem.getAttribute(BIND), elem.appendChild(newNode));
					break;
                }

                return true;
            }
            return false;
        }

        function writeAttribute(elem, attr) {
            var newAttrObj = {};

            if (!!attr) {
                // The data attribute must exist.
                newAttrObj.name = attr.split("=")[0];
                newAttrObj.value = attr.split("=")[1];
            }

            if (template.requiresInterpolation(newAttrObj.value)) {
                newAttrObj.value = template.evaluateInterpolation(newAttrObj.value);
            }
            // If they attribute already exists and the value wasn't interpolated.
            if (elem.hasAttribute(newAttrObj.name) && template.requiresInterpolation(newAttrObj.value)) {
                return;
            } else {
                elem.setAttribute(newAttrObj.name, newAttrObj.value);
                return;
            }
        }

		if (!templateNode.content) {
			//	Not a valid HTML5 template browser.
			var frag = document.createDocumentFragment();
			for(var c = 0; c < templateNode.children.length; c += 1) {
				frag.appendChild(templateNode.children[c].cloneNode(true));
			}
			templateNode = frag;
        } else if (!templateNode.content.querySelector(rootElement)) {
            throw ("J.Render: Template doesn't contain specified rootElement " + rootElement);
        } else {
            // It's an HTML5 Template, import it's specified root node.
            templateNode = document.importNode(templateNode.content, true);
		}

        template = new J.Template(templateNode, model);

        dataElements = template.getTemplateElement().querySelectorAll("[" + BIND + "]");

        for (i; i < dataElements.length; i += 1) {
            bindData(dataElements[i]);
        }

        dataAttributes = template.getTemplateElement().querySelectorAll("[" + ATTRIBUTE + "]");
        for (i = 0; i < dataAttributes.length; i += 1) {

			var attributes = dataAttributes[i].getAttribute(ATTRIBUTE).split('&'); // all attributes in an element.
			for(var j =0; j < attributes.length; j += 1) {
				writeAttribute(dataAttributes[i], attributes[j]);
			}
			dataAttributes[i].removeAttribute(ATTRIBUTE);
        }

        return template;
    };

    J.Template = new J.Class();

    J.Template.prototype.init = function (templateElement, dataModel) {
        this.nodes = {};
        this.observers = [];

		var thisTemplateElement = templateElement || document.createElement('template');
		var thisModel = dataModel || {};


		this.getTemplateElement = function () {
			return thisTemplateElement;
		}.bind(this);
		this.setTemplateElement = function (newTemplateElement) {
			thisTemplateElement = newTemplateElement;
		}.bind(this);

		this.getDataModel = function () {
			return thisModel;
		}.bind(this);
		this.setDataModel = function (newDataModel) {
			thisModel = newDataModel;
			for (name in this.nodes) {
                if (this.nodes.hasOwnProperty(name)) {
                    this['set' + capitalizeFirstLetter(name)](this.evaluate(name));
                }
            }
		}.bind(this);

		return this;
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
        // Loop all bound nodes and update the bound elements.
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

        // Update the data context last:
        try {
            this.updateDataContext(name, newValue);
        } catch (e) {
	        J.log(e, 'error');
        }

    };

    /**
		function addBoundParameter: Adds a data bound parameter with getters and setters to the template API.
		@name: The text string name of the new bound parameter.
		@node: A reference to an HTML node to which the data is bound.
	*/
    J.Template.prototype.addBoundParameter = function (name, node) {
        // Adds methods for manipulating an injected parameter.
		if (!this.getTemplateElement().contains(node)) {
            var e = new JTemplateException("J.Template must contain argument node", {
                'node': node,
                'element': this.getTemplateElement()
            });
            e.throwException();
        }

		// If the named parameter is new, create it in the nodes array.
        if (this.nodes[name] === undefined) {
            this.nodes[name] = [node];

            this["get" + capitalizeFirstLetter(name)] = function () {
                return this.getter(name);
            };
            this["set" + capitalizeFirstLetter(name)] = function (newValue) {
                return this.setter(name, newValue);
            };
        } else {
			//	Push the node onto the existsing nodes array for update when set.
            this.nodes[name].push(node);
        }

        /* Add any eventListeners */
        switch (node.nodeName) {
        case 'INPUT':
		case 'TEXTAREA':
            node.addEventListener('change', function (evt) {
                this.setter(name, evt.currentTarget.value);
            }.bind(this));
            break;
        case 'SELECT':
			node.addEventListener('change', function (evt) {
				var currentIndex =  evt.currentTarget.options.selectedIndex;
				this.setter(name, evt.currentTarget.options[currentIndex]);
			}.bind(this));
			break;
        default:
            // For non-input elements, add mutation observers.
            if (!!window.MutationObserver) {
                this.observers.push(
                    (function (target) {
                        // create an observer instance
                        var observer = new window.MutationObserver(function (mutations) {
                                mutations.forEach(function (mutation) {
                                    window.console.log(mutation.type);
                                });
                            }),
                            config = { attributes: true, childList: true, characterData: true }; // configuration of the observer:

                        // pass in the target node, as well as the observer options
                        observer.observe(target, config);

                        // later, you can stop observing
                        return observer;
                    }(node))
                );
            }
        }


        return this["set" + capitalizeFirstLetter(name)].bind(this);
    };

    J.Template.prototype.updateDataContext = function (name, value, context) {
		var nameArray = name.split(".");
        var current = nameArray.shift();

        if (typeof context === "undefined") {
            context = this.getDataModel();
        }

        switch (typeof context[current]) {
        case "object":
            return !!context[current] ?
				this.updateDataContext(nameArray.join('.'), value, context[current]) : (context[current] = value);
        default:
            context[current] = value;
            return true;
        }
    };

    J.Template.prototype.evaluate = function (param, context) {
        // Test a parameter string and evaluate if it exists in the data context.
        var current;

        if (typeof context === "undefined") {
            context = this.getDataModel();
        }

        param = param.split(".");
        current = param.shift();

        if (context.hasOwnProperty(current)) {
            switch (typeof context[current]) {
            case "function":
                return context[current]();
            case "object":
                return !!context[current] ? this.evaluate(param.join('.'), context[current]) : "";
            default:
                if (typeof context[current] !== "undefined") {
                    return context[current];
                } else {
                    return false;
                }
            }
        }
    };

	J.Template.prototype.interpolationExpression =/(?:\{)([\d\w\.]+)(\:((?:[1-9][\d]*(?:\.[\d]+))|0|null|true|false|(?:(\'|\")([^\4]*)\4)))?(?:\})/i;

    J.Template.prototype.evaluateInterpolation = function (str) {
		//	Capture Groups:
		//	0:	The entire match.
		//	1:	Parameter name.
		//	2:	Default value if exists, including ':'
		//	3:	Default value if exists.
		//	4:	The delimter of a string.

		var matches = this.interpolationExpression.exec(str);

        var param = matches[1];
		var value = this.evaluate(param);

		str = str.replace(this.interpolationExpression, function(match, p1, p2, p3, p4) {
			//	If the value is found, use it.
			if (!!value) {
				return value;
			} else if (p3 !== ''){
				//	If a default value is expressed in the expression, use it.
				this.updateDataContext(p1, p3);
				return p3;
			} else {
				//	Else, return a blank string.
				return '';
			}
		}.bind(this));


        return str;
    };

    J.Template.prototype.requiresInterpolation = function (str) {
		return !!this.interpolationExpression.test(str);
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

	var shallowCopyOfNodeReferences = [];
	var templateInsertionPoint = [];
    J.Template.prototype.render = function (targetElement) {
		//	IE Needs some convincing.
		if (!this.getTemplateElement().children){
			this.getTemplateElement().children = (function(e){
				var children = [];
				for(var x = 0; x < e.childNodes.length; x += 1){
					if(e.childNodes[x].nodeType === Node.ELEMENT_NODE){
						children.push(e.childNodes[x]);
					}
				}
				return children;
			})(this.getTemplateElement());
		}

		shallowCopyOfNodeReferences = [].slice.call(this.getTemplateElement().children, 0);
		templateInsertionPoint = targetElement;

		templateInsertionPoint.appendChild(this.getTemplateElement());

        return;
    };

    J.Template.prototype.remove = function () {
		//	Remove Nodes.
		var fragment = document.createDocumentFragment();
		while(shallowCopyOfNodeReferences.length > 0) {
			fragment.appendChild(templateInsertionPoint.removeChild(shallowCopyOfNodeReferences.pop()));
		}
		this.setTemplateElement(fragment);

        return;
    };

	J.Template.prototype.find = function(querySelectorString){
		if (shallowCopyOfNodeReferences.length === 0){
			return this.getTemplateElement().querySelector(querySelectorString);
		} else {
			var element;
			for(var i = 0; i < shallowCopyOfNodeReferences.length; i += 1){
				element = shallowCopyOfNodeReferences[i];
				if(element.querySelector(querySelectorString)){
					return element.querySelector(querySelectorString);
				}
			}
			return null;
		}
	}

	J.Template.prototype.findAll = function(querySelectorString){
		if (shallowCopyOfNodeReferences.length === 0){
			return this.getTemplateElement().querySelectorAll(querySelectorString);
		} else {
			for(element in shallowCopyOfNodeReferences){
				if(element.querySelectorAll(querySelectorString).length > 0){
					return element.querySelector(querySelectorString);
				}
			}
			return new NodeList();
		}
	}

}(window.J));
