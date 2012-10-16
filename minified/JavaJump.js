var J;
Object.prototype.extend = function (o) {"use strict"; this.prototype = o.prototype; this.prototype.constructor = this; return this; };
function Class() {"use strict"; var a = function () {if (arguments.length > 0) {this.init.apply(this, arguments); } else { this.init(); } }; a.prototype.init = function () {}; return a; }
function JavaJump() {"use strict"; this.Jboxes = []; this.onloadEvent = ""; }
JavaJump.prototype.Main = function () {"use strict"; };
JavaJump.prototype.Start = function () {"use strict"; var i = 0; for (i; i < this.Jboxes.length; i = i + 1) {this.Jboxes[i].Jump(); this[this.Jboxes[i].name] = this.Jboxes[i]; } this.Main(); };
J = new JavaJump();
if (window.addEventListener) {window.addEventListener('load', function (e) {"use strict"; J.Start(e); }, false); } else { window.onload = function (evt) {"use strict"; evt = evt || window.event; J.Start(evt); }; }