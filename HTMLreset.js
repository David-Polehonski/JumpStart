// JavaScript Document - HTML 5 BODGE IT! (JavaJumpBox)
(function(J){
    var _newElements_inline = [
        'menu','menuitem','details','summary','data','datalist','main',
        'track','embed','source','keygen','bdi','math','svg',
        'progress','ruby','rp','rt','wbr','mark','meter','time'];
    
    var _newElements_block = [
        'section','nav','article','aside','header','hgroup','footer',
        'figure','figcaption','canvas','audio','output','video'
    ]
    
    var _newElements_nonvisible = [
        'template'
    ]
    
    for(var i =0; i < _newElements_inline.length; i++){
       document.createElement(_newElements_inline[i]); 
    }
    
    for(var b =0; b < _newElements_block.length; b++){
       document.createElement(_newElements_block[b]); 
    }
    
    for(var v =0; v < _newElements_nonvisible.length; v++){
       document.createElement(_newElements_nonvisible[v]); 
    }
    
    // Poly fill: 'Array.indexOf'
    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function (searchElement, fromIndex) {
            if ( this === undefined || this === null ) {
                throw new TypeError( '"this" is null or not defined' );
            }

            var length = this.length >>> 0; // Hack to convert object.length to a UInt32

            fromIndex = +fromIndex || 0;

            if (Math.abs(fromIndex) === Infinity) {
                fromIndex = 0;
            }

            if (fromIndex < 0) {
                fromIndex += length;
                if (fromIndex < 0) {
                fromIndex = 0;
                }
            }

            for (;fromIndex < length; fromIndex++) {
                if (this[fromIndex] === searchElement) {
                    return fromIndex;
                }
            }
            return -1;
        };
    }
    
    // Poly fill: 'Function.bind'
    if (!Function.prototype.bind) {
        Function.prototype.bind = function (oThis) {
        if (typeof this !== "function") {
            // closest thing possible to the ECMAScript 5 internal IsCallable function
            throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
        }

        var aArgs = Array.prototype.slice.call(arguments, 1), 
            fToBind = this, 
            fNOP = function () {},
            fBound = function () {
            return fToBind.apply(this instanceof fNOP && oThis
                                     ? this
                                     : oThis,
                                     aArgs.concat(Array.prototype.slice.call(arguments)));
        };

        fNOP.prototype = this.prototype;
        fBound.prototype = new fNOP();

        return fBound;
        };
    }
    
    var HTML = new J.Class();
    
    HTML.prototype.Jump = function(){
        var newStyle = document.getElementsByTagName('head')[0].appendChild(document.createElement('style'));
        newStyle.styleSheet.addRule("html.ie *","zoom:1;",0);
        
        for(var b = 0; b < _newElements_block.length; b++){
            newStyle.styleSheet.addRule(_newElements_block[b],"display:block;",0); 
        }
        
        for(var v = 0; v < _newElements_nonvisible.length; v++){
            newStyle.styleSheet.addRule(_newElements_nonvisible[v],"display:none;",0); 
        }
    }
    
    J.JumpStart(new HTML());
    
})(window.J);



