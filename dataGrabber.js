//	Class: dataGrabber.js
J.dataGrabber = new Class();

J.dataGrabber.prototype.getData = function(HTMLelement)
{
	var a = 0, attribute, dataset = {}, pattern = /^data-[a-zA-Z]/i;
	if(this.isHtml(HTMLelement))
	{
		if(HTMLelement.dataset)
		{
			return HTMLelement.dataset;	
		} else 
		{
			//Polyfill until supported
			for(a; a < HTMLelement.attributes.length; a += 1)
			{
				attribute = HTMLelement.attributes[a];
				if(pattern.test(attribute.nodeName))
				{
					dataset[attribute.nodeName.substr(attribute.nodeName.indexOf('-')+1)] = attribute.value;
				}
			}	
			return dataset;
		}
	}
	return null;
}

J.dataGrabber.prototype.isHtml = function(obj)
{
	if(obj.nodeType == 1 && typeof(obj.innerHTML) != "undefined")
	{
		return true;
	}
	return false;
}