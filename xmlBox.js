//JavaJumpBox - XMLhttpBox version 0.0.1
//V0.1.0

// DOCS -
//	V 0.1.0, Added sendForm function allowing the submission of forms remotely to the target specified in the request function.

function xhr(){}

xhr.prototype.Jump = function (){
	this.name = "XHR";
	this.requests = new Array();
}
//Function creates a new xmlHttpRequest object pushes onto array and returns array index
xhr.prototype.request = function (method,target){
	var xmlhttp;
	var id;
	if (window.XMLHttpRequest){
		// code for IE7+, Firefox, Chrome, Opera, Safari
		xmlhttp=new XMLHttpRequest();
	}else{
		// code for IE6, IE5
		xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
	}
	
	xmlhttp.open(method,target,true);
	
	id = this.requests.push(xmlhttp);
	id -=1; //decrement length to equal array index;
	
	return id;
}

xhr.prototype.sendform = function(id,formName){
		var formObj = false;
		var forms = document.getElementsByTagName('form');
		for (var I=0; I < forms.length; I++){
			if(forms[I].name == formName){
				formObj = forms[I];		
			}
		}
		if(formObj){
			params = "";
			
			for(i=0; i<formObj.elements.length; i++){
				if(formObj.elements[i].type == "checkbox"){
					params+=formObj.elements[i].name+"="+formObj.elements[i].checked;
				}else if(formObj.elements[i].type == "text" || formObj.elements[i].type == "hidden" ){
					params+=formObj.elements[i].name+"="+formObj.elements[i].value;
				}else if(typeof(formObj.elements[i].selectedIndex) != "undefined"){
					params+=formObj.elements[i].name+"="+formObj.elements[i].options[formObj.elements[i].selectedIndex].value;
				}
				
				params+="&"
				
			}		
		}
		this.requests[id].setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		this.requests[id].setRequestHeader("Content-length", params.length);
		this.requests[id].setRequestHeader("Connection", "close");	
		this.requests[id].send(params);
}

xhr.prototype.send = function(id){
	if(id =="all"){
		for (var i=0; i<xhr.requests.length; i++){
			if(this.requests[i].readyState == 1){
				
				this.requests[i].send();	
			}
		}
	}else{
		if(this.requests[id].readyState == 1){
			this.requests[id].send();	
		}
	}
}

J.JumpStart(new xhr());