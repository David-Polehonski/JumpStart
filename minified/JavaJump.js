Object.prototype.extend = function (O) {"use strict"; this.prototype = new O(); this.prototype.constructor = this; };
function Class() {"use strict"; return function () {}; }
function JJ() { "use strict"; this.Jboxes = []; }
JJ.prototype.Main = function () {"use strict"; };
JJ.prototype.S = function () {"use strict"; var i = 0; for (i; i < this.Jboxes.length; i += 1) {this.Jboxes[i].Jump(); this[this.Jboxes[i].name] = this.Jboxes[i]; } this.Main(); };
var J = new JJ();
function s(e) {"use strict"; J.S(e); }
if (window.addEventListener) { window.addEventListener('load', s, false); } else {window.onload = function (e) {"use strict"; e = e || window.event; J.S(e); }; }

