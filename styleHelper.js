// JavaScript Documentvar 
styleHelper = new Class()

styleHelper.prototype.xBrowserGetStyles = function(styleBlock)
{
	if(typeof(styleBlock.sheet) != "undefined")
	{
		var styleRules = styleBlock.sheet 
	}else if (typeof(styleBlock.styleSheet) != "undefined")
	{
		styleBlock.sheet = styleBlock.styleSheet;
		styleBlock.sheet.cssRules = styleBlock.styleSheet.rules;
		var styleRules = styleBlock.sheet;
	}else
	{
		return null;	
	}
	
	styleRules.addRules = function(selector,rules)
		{
			if(typeof(this.insertRule) != "undefined")
			{
				for(var i=0; i<rules.length; i++)
				{
					this.insertRule(selector + "{" + rules[i] + "}",this.cssRules.length);
				}
			}else if(typeof(this.addRule) != "undefined")
			{
				for(var i=0; i<rules.length; i++)
				{
					this.addRule(selector,rules[i],this.cssRules.length);
				}
			}else
			{
				return false;
			}
		}
	return styleRules;
}

styleHelper.prototype.createNewStyleElement = function() 
{
	styleBlock = document.getElementsByTagName('head')[0].appendChild(document.createElement('style'));
	return this.xBrowserGetStyles(styleBlock);
}

styleHelper.prototype.getElementStyleSheet = function(styleBlock)
{
	return this.xBrowserGetStyles(styleBlock);
}