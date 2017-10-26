/*@jStyles.js
	Adds and API to the J namespace for adding / modifying CSS Rules and Stylesheets
*/
(function(J){
	var Styles = J.Class( 'Styles' );

	Styles.prototype.init = function (J) {
		return this.createNewStyleElement();
	}

	Styles.prototype.getStyles = function(styleBlock) {
		var styleRules;
		if(!!styleBlock.sheet){
			styleRules = styleBlock.sheet;
		}else if (!!styleBlock.styleSheet) {
			styleBlock.sheet = styleBlock.styleSheet;
			styleBlock.sheet.cssRules = styleBlock.styleSheet.rules;
			styleRules = styleBlock.sheet;
		}else{
			return null;
		}

		styleRules.addRules = function(selector,rules) {
			var i, ruleString;
			if (!!this.insertRule) {
				ruleString = selector + " {";
				for(i = 0; i < rules.length; i++) {
					ruleString += rules[i];
					if (!/;$/.test(rules[i])) {
						ruleString += ";";
					}
				}
				this.insertRule(ruleString + "}",this.cssRules.length);

			} else if (typeof(this.addRule) != "undefined") {
				for (i = 0; i < rules.length; i++) {
					this.addRule(selector,rules[i],this.cssRules.length);
				}
			}else {
				return false;
			}
		};
		return styleRules;
	};

	Styles.prototype.createNewStyleElement = function(){
		var head = document.head || document.getElementsByTagName('head')[0];
		styleBlock = document.createElement('style');
		styleBlock = head.appendChild(styleBlock);

		return this.getStyles(styleBlock);
	};

	Styles.prototype.getElementStyleSheet = function(styleBlock){
		return this.getStyles(styleBlock);
	};

	J.export('Styles', Styles);
		
})(window.J);
