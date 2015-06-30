/*@objectFunctions.js
    Injects helper functions into 'J' to help with object manipulation.
*/
(function (J) {
    "use strict";
    var JObject = new J.Class();
    
    
    JObject.prototype.init = function (variable) {
        if (this.isObject(variable)) {
            this.obj = variable;
        }
    };
    
    /*@objectIsObject
        Verifies variable is an Object.
    */
    JObject.prototype.isObject = function (variable) {
        if (!!variable && typeof (variable) !== "object") {
            return false;
        }
        return true;
    };
    /*@objectIsEmpty
        Use object keys if possible, else use iterative method.
    */
    JObject.prototype.isEmpty = function () {
        var prop;
        if (!!Object.keys) {
            if (Object.keys(this.obj).length !== 0) {
                return false;
            }
        } else {
            for (prop in this.obj) {
                if (this.obj.hasOwnProperty(prop)) {
                    return false;
                }
            }
        }
        return true;
    };
    /*@J.object
        objectFunction entry point.
    */
    J.object = function (obj) {
        return new JObject(obj);
    };
}(window.J));