function styles (J) {
	return this.createNewStyleElement();
}

styles.prototype.xBrowserGetStyles = function(styleBlock){
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

styles.prototype.createNewStyleElement = function(){
	var head = document.head || document.getElementsByTagName('head')[0];
	styleBlock = document.createElement('style');
	styleBlock = head.appendChild(styleBlock);

	return this.xBrowserGetStyles(styleBlock);
};

styles.prototype.getElementStyleSheet = function(styleBlock){
	return this.xBrowserGetStyles(styleBlock);
};

J.jumpStart(styles);
