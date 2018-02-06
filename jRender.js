/*@Jrender.js
		Description: Jumpstart Module, template renderer engine.
*/
J.require('objectFunctions.js');
J.require('polyfilFunctions.js');
(function (J) {
	"use strict";

	var CONTENT = 'data-bind-content'; // Bool: do we want to bind the content of this element to the model?
	var EXPRESSION = 'data-bind-expression'; // String: Expression string used to interpolate values into the content
	var TEMPLATE = 'data-bind-template'; // Selector: Unique Selector to an HTML template to use as a sub template for output.
	var ATTRIBUTES = 'data-bind-attributes'; // JSON: An object of key=values where the key is that attribute name, and the value is a property of the model

	var JTemplateException = J.Class('JTemplateException');

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

	var JTemplateAttribute = J.Class("JTemplateAttribute");

	function defineAccessors (object, property, definitions) {
		var properties = property.split('.');
		var property = properties.shift();

		if (typeof object[property] === 'object' && object[property] !== null ) {
			defineAccessors(object[property], properties.join('.'), definitions);
		} else if (object.hasOwnProperty(property)) {

			var _value = evaluate(property, object);
			var currentDescriptor = Object.getOwnPropertyDescriptor(object, property);

			if (typeof currentDescriptor.set === 'function' && typeof definitions.set === 'function') {
				var defSetter = definitions.set.bind(object);
				var setter = currentDescriptor.set.bind(object);
				definitions.set = function (newValue) {
					return defSetter(setter(newValue));
				};
			} else {
				var defSetter = definitions.set.bind(object);
				definitions.set = function (newValue) {
					return defSetter(_value = newValue);
				};
			}

			if (typeof currentDescriptor.get === 'function' && typeof definitions.get === 'function') {
				var defGetter = definitions.get.bind(object);
				var getter = currentDescriptor.get.bind(object);
				definitions.get = function () {
					return defGetter(getter());
				};
			} else {
				var defGetter = definitions.get.bind(object);
				definitions.get = function () {
					return defGetter(_value);
				};
			}
			//	Now update the property definition.
			Object.defineProperty(object, property, definitions);
		} else {
			//	If the property doesn't exist
			_value = null;
			Object.defineProperty(object, property, {
				set: function(newValue) { _value = newValue; },
				get: function() { return _value; },
				configurable: true
			});
		}
	}

	function evaluate (param, context) {
		// Test a parameter string and evaluate if it exists in the data context.
		var current;
		param = param.split(".");
		current = param.shift();

		if (context.hasOwnProperty(current)) {
			switch (typeof context[current]) {
				case "function":
						return context[current]();
				case "object":
						return !!context[current] ? evaluate(param.join('.'), context[current]) : "";
				default:
					if (typeof context[current] !== "undefined") {
						return context[current];
					}
			}
		}
		return null;
	}

	function update (param, value, context) {
		var current;
		param = param.split(".");
		current = param.shift();

		if (context.hasOwnProperty(current)) {
			switch (typeof context[current]) {
			case "function":
					context[current]( value );
			case "object":
					return !!context[current] ? update(param.join('.'), value, context[current]) : "";
			default:
				if (typeof context[current] !== "undefined") {
					context[current] = value;
				}
			}
		}
	}

	var interpolationExpression =/(?:\{!)([\d\w\.]+)(?:(?:\:)((?:0(?=\.)|[1-9])[0-9]*(?:\.[\d]+)|0|null|true|false|(\'|\")(.*)(\3)))?(?:\})/ig;
	function evaluateExpression (expression, model) {
		//	Capture Groups:
		//	0:	The entire match.
		//	1:	Parameter name.
		//	2:	Default value if exists, including ':'
		//	3:	Default value if exists.
		//	4:	The delimter of a string.
		//	{!variable.sequence}
		var str = expression;
		var re = new RegExp(interpolationExpression);
		var matches;
		var fx = function(match, p1, p2, p3, p4, p5) {
			var value = evaluate(p1, model); //	If the value is found, use it.
			return value || p4 || '';
		};

		while ((matches = re.exec(expression)) !== null) {
			str = str.replace(interpolationExpression, fx);
		}
		return str;
	};

	JTemplateAttribute.resolve = function (model, element, expression) {
		//	Is the expression a simple value, of an interpolation expression.
		var re = new RegExp(interpolationExpression);
		if (re.test(expression)) {
			return evaluateExpression(expression, model);
		} else {
			return evaluate(expression, model);
		}
	};

	JTemplateAttribute.prototype.init = function (model, element, attributeName, propertyName){
		var newAttribute = document.createAttribute(attributeName);
		var newAttributeValue = evaluate(propertyName, model);
		newAttribute.value = (newAttributeValue === null)? '' : newAttributeValue;

		element.setAttributeNode(newAttribute);

		var re = new RegExp(interpolationExpression);
		if (re.test(propertyName)) {

			//	The property is an expression, one way binding allowed
			var properties = [];
			var expressionRe = new RegExp(interpolationExpression);
			var expression = propertyName;
			var matches;

			while((matches = expressionRe.exec(expression)) !== null) {
				properties.push(matches[1]);
			}

			properties.forEach(function (property) {
				//	Defined the accessors for any properties used here:
				defineAccessors(model, property, {
					get: function (value) {
						return value;
					},
					set: function (newValue) {
						var v = JTemplateAttribute.resolve(model, element, expression);
						newAttribute.value = (v !== null) ? v : '';
						return newValue;
					}
				} );
			});
			newAttribute.value = JTemplateAttribute.resolve(model, element, expression);
		} else {
			// Simple/ Direct mapping allows two way binding or attributes
			defineAccessors(model, propertyName, {
				get: function (value) {
					return value;
				},
				set: function (newValue) {
					var v = JTemplateAttribute.resolve(model, element, expression);
					newAttribute.value = (v !== null) ? v : '';
					return newValue;
				}
			} );

			var observer = new MutationObserver( function (mutations) {
				for(var i = 0; i < mutations.length; i++) {
					if (mutations[i].attributeName === newAttribute.name && evaluate(propertyName, model) !== newAttribute.value) {
						update(propertyName, newAttribute.value, model);
					}
				}
			} );
			observer.observe(element, {'attributes':true});
		}

		return this;
	};

	var JTemplateNode = J.Class("JTemplateNode");
	JTemplateNode.prototype.init = function (model, element, expression) {
		// this.model = model;
		// this.element = element;
		// this.expression = expression;

		var re = new RegExp(interpolationExpression);
		var properties = [];
		var matches;

		while((matches = re.exec(expression)) !== null) {
			properties.push(matches[1]);
		}

		properties.forEach(function (property) {
			//	Defined the accessors for any properties used here:
			var _ = evaluate(property, model);
			defineAccessors(model, property, {
				get: function (value) {
					return value;
				},
				set: function (newValue) {
					element.textContent = JTemplateNode.resolve(model, element, expression);
					return newValue;
				}
			} );
		});

		element.textContent = JTemplateNode.resolve(model, element, expression);

		var observer = new MutationObserver( function (mutations) {
			var re;
			for(var i = 0; i < mutations.length; i++) {
				re = new RegExp(interpolationExpression);
				if (!interpolationExpression.test(expression) && evaluate(propertyName, model) !== element.textContent) {
					update(propertyName, element.textContent, model);
				}
			}
		} );
		observer.observe(element, {'childList':true, 'characterData':true});

		return this;
	};

	JTemplateNode.resolve = function (model, element, expression) {
		//	Is the expression a simple value, of an interpolation expression.
		var re = new RegExp(interpolationExpression);
		if (re.test(expression)) {
			return evaluateExpression(expression, model);
		} else {
			return evaluate(expression, model);
		}
	}

	var JTemplateInput = J.Class("JTemplateInput");
	JTemplateInput.prototype.init = function (model, element, expression) {
		// this.model = model;
		// this.element = element;
		// this.expression = expression;
		if (element.nodeName !== 'INPUT') {
			throw(new JTemplateException('Invalid Argument Exception, Element passed to JTemplateInput is a ' + element.nodeName) );
		}

		var re = new RegExp(interpolationExpression);
		var properties = [];
		var matches;

		if (re.test( expression )) {
			while((matches = re.exec(expression)) !== null) {
				properties.push(matches[1]);
			}

			properties.forEach(function (property) {
				//	Defined the accessors for any properties used here:
				var _ = evaluate(property, model);
				defineAccessors(model, property, {
					get: function (value) {
						return value;
					},
					set: function (newValue) {
						var v = JTemplateInput.resolve(model, element, expression);
						element.value = (v !== null) ? v : '';
						return newValue;
					}
				} );
			});
		} else {
			//	Direct / Simple value binding
			defineAccessors(model, expression, {
				get: function (value) {
					return value;
				},
				set: function (newValue) {
					var v = JTemplateInput.resolve(model, element, expression);
					element.value = (v !== null) ? v : '';
					return newValue;
				}
			} );
		}

		element.value = JTemplateInput.resolve(model, element, expression);

		element.addEventListener('change', function (changeEvent) {
			re = new RegExp(interpolationExpression);
			if (!interpolationExpression.test(expression) && evaluate(expression, model) !== element.value) {
				update(expression, element.value, model);
			}
		}, false);

		return this;
	};

	JTemplateInput.resolve = function (model, element, expression) {
		//	Is the expression a simple value, of an interpolation expression.
		var re = new RegExp(interpolationExpression);
		if (re.test(expression)) {
			return evaluateExpression(expression, model);
		} else {
			return evaluate(expression, model);
		}
	};

	var JTemplateSelect = J.Class("JTemplateSelect");
	JTemplateSelect.prototype.init = function (model, element, expression) {
		// this.model = model;
		// this.element = element;
		// this.expression = expression;
		if (element.nodeName !== 'SELECT') {
			throw(new JTemplateException('Invalid Argument Exception, Element passed to JTemplateInput is a ' + element.nodeName) );
		}

		var re = new RegExp(interpolationExpression);
		var properties = [];
		var matches;

		if (re.test( expression )) {
			while((matches = re.exec(expression)) !== null) {
				properties.push(matches[1]);
			}

			properties.forEach(function (property) {
				//	Defined the accessors for any properties used here:
				var _ = evaluate(property, model);
				defineAccessors(model, property, {
					get: function (value) {
						return value;
					},
					set: function (newValue) {
						var resolvedValue = JTemplateSelect.resolve(model, element, expression);
						for (var i = 0; i < element.options.length; i++) {
							if (element.options[i].value == resolvedValue) {
								element.selectedIndex = i;
								break;
							}
						}
						return newValue;
					}
				} );
			});
		} else {
			//	Direct / Simple value binding
			defineAccessors(model, expression, {
				get: function (value) {
					return value;
				},
				set: function (newValue) {
					var resolvedValue = JTemplateSelect.resolve(model, element, expression);
					for (var i = 0; i < element.options.length; i++) {
						if (element.options[i].value == resolvedValue) {
							element.selectedIndex = i;
							break;
						}
					}
					return newValue;
				}
			} );
		}

		element.value = JTemplateSelect.resolve(model, element, expression);

		element.addEventListener('change', function (changeEvent) {
			re = new RegExp(interpolationExpression);
			if (!interpolationExpression.test(expression) && evaluate(expression, model) !== element.value) {
				update(expression, element.value, model);
			}
		}, false);

		return this;
	};

	JTemplateSelect.resolve = function (model, element, expression) {
		//	Is the expression a simple value, of an interpolation expression.
		var re = new RegExp(interpolationExpression);
		if (re.test(expression)) {
			return evaluateExpression(expression, model);
		} else {
			return evaluate(expression, model);
		}
	};

	J.render = function (templateNode, newModel) {
		// Only Accepts HTML5 Templates.
		var i = 0;
		var	template;
		var model = (typeof newModel === "undefined") ? {} : newModel // Create a blank data context

		if (!templateNode.content) {
			//	Not a valid HTML5 template browser.
			var frag = document.createDocumentFragment();
			for(var c = 0; c < templateNode.children.length; c += 1) {
				frag.appendChild(templateNode.children[c].cloneNode(true));
			}
			templateNode = frag;
		} else {
			// It's an HTML5 Template, import it's specified root node.
			templateNode = document.importNode(templateNode.content, true);
		}

		//	Create the Template Object
		template = new J.Template(templateNode, model);

		return template;
	};

	J.Template = J.Class("Template");

	J.Template.prototype.init = function (templateElement, dataModel) {
		this.nodes = [];

		var _TemplateElement = templateElement || document.createElement('template');
		var _Model = dataModel || {};

		var fields = [];

		Object.defineProperty( this, 'element', {
			get: function () {
				return _TemplateElement;
			},
			set: function (newTemplate) {
				_TemplateElement = newTemplate
			}
		});

		Object.defineProperty( this, 'model', {
			get: function () {
				return _Model;
			},
			set: function (newDataModel) {
				_Model = newDataModel;
				this.activate();
			}
		});

		this.activate();

		return this;
	};

	J.Template.prototype.activate = function () {
		var expressions = this.element.querySelectorAll('[' + CONTENT + '],[' + ATTRIBUTES + ']');
		[].forEach.call(expressions, function ( htmlElement ){
			if (htmlElement.hasAttribute(CONTENT) && htmlElement.getAttribute(CONTENT) === "true") {
				//	Bind element content
				if (htmlElement.hasAttribute(EXPRESSION)) {
					//	If an expression is defined, use it instead of the content.
					var expression = htmlElement.getAttribute(EXPRESSION);
				}
				//	Bind expressions can be implicitly set in some basic use cases.
				/* e.g.
					<div data-bind-content='true'>model.value</div>
					<div data-bind-content='true'>This may be a {!model.value} expession with !{model.values} interpolated</div>
					<input name='test' data-bind-content='true' value='model.value' />
					<input name='test' data-bind-content='true' value='format of {!model.value}' />
				*/
				switch (htmlElement.nodeName) {
					case 'INPUT':
						if (!expression){
							var expression = htmlElement.value; // Check the value param for an expression
							htmlElement.value = ''; // nuke it to remove the expression from output.
						}
						this.nodes.push(new JTemplateInput(this.model, htmlElement, expression));
						break;
					case 'SELECT':
						if (!expression) {
							throw( new JTemplateException('Invalid bind configuration, cannot implicitly bind a select element') );
						}
						this.nodes.push(new JTemplateSelect(this.model, htmlElement, htmlElement.getAttribute(EXPRESSION)));
						break;
					default:
						if (!expression) {
							if (htmlElement.children.length !== 0) {
								throw( new JTemplateException('Invalid bind configuration, cannot bind an expression to an element with children') );
							} else if (/^\s+$/g.test(htmlElement.textContent)) {
								throw( new JTemplateException('Invalid bind configuration, the element is empty enter and expression or use the data-bind-expression attribute') );
							} else {
								var expression = htmlElement.textContent;
							}
						}
						this.nodes.push(new JTemplateNode(this.model, htmlElement, expression));
						break;
				}
			}

			if (htmlElement.hasAttribute(ATTRIBUTES)) {
				//	Bind element attributes
				try {
					var attributes = JSON.parse(htmlElement.getAttribute(ATTRIBUTES));
				} catch (e) {
					J.log(htmlElement.getAttribute(ATTRIBUTES));
				}
				if (typeof attributes === 'object') {
					for (var attributeName in attributes) {
						this.nodes.push(new JTemplateAttribute(this.model, htmlElement, attributeName, attributes[attributeName]));
					}
				}
			}
		}.bind(this));
	}

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

	J.Template.prototype.attach = function (targetElement) {
		if (!this.element.children) {
			//	If the element doesn't have the `children` property; define it now.
			this.element.children = (function(e) {
				var children = [];
				for(var x = 0; x < e.childNodes.length; x += 1) {
					if(e.childNodes[x].nodeType === Node.ELEMENT_NODE){
						children.push(e.childNodes[x]);
					}
				}
				return children;
			})(this.element);
		}
		//	Grab a private reference to the children of the template, and the insertion point
		var shallowCopyOfNodeReferences = [].slice.call(this.element.children, 0);
		var templateInsertionPoint = targetElement;

		//	Now we insert the template.
		templateInsertionPoint.appendChild(this.element);
		this.element = templateInsertionPoint;
		this.attached = true;
		this.remove = function () {
			var fragment = document.createDocumentFragment();
			while(shallowCopyOfNodeReferences.length > 0) {
				fragment.appendChild(templateInsertionPoint.removeChild(shallowCopyOfNodeReferences.pop()));
			}

			this.element = fragment;
			this.attached = !(delete this.remove);
		}

		return this;
	};

	J.Template.prototype.remove = function () {
		throw(new JTemplateException('Cannot remove, template is already dettached'));
		return;
	};

	J.Template.prototype.find = function(querySelectorString){
		if (shallowCopyOfNodeReferences.length === 0){
			return this.element.querySelector(querySelectorString);
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
	};

	J.Template.prototype.findAll = function(querySelectorString){
		if (shallowCopyOfNodeReferences.length === 0){
			return this.element.querySelectorAll(querySelectorString);
		} else {
			for(var element in shallowCopyOfNodeReferences){
				element = shallowCopyOfNodeReferences[element];
				if(element.querySelectorAll(querySelectorString).length > 0){
					return element.querySelectorAll(querySelectorString);
				}
			}
			return new NodeList();
		}
	};

}(window.J));
