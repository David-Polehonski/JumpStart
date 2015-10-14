/*@jFrames
	J Framerate class
*/
(function (J) {
	var Framerate = new J.Class();

	Framerate.prototype.init = function(J) {
		J.Framerate = this;
	};

	Framerate.prototype.setRate = function(rate) {
	  // Calculate new time difference between frames
	  this.frameLen = 1000 / rate;
	};

	Framerate.prototype.reset = function() {
	  // Create Date object
	  var d = new Date();

	  // Reset time of the last time to the current one
	  this.prevTime = d.getTime();
 	};

	Framerate.prototype.getFrames = function() {
	  // Create Date object
	  var d = new Date();

	  // Get current time, in milliseconds
	  var currTime = d.getTime();

	  // Calculate amount of frames elapsed
	  // Also update time of the last frame if needed
	  var totalFrames = 0;
	  while (this.prevTime + this.frameLen <= currTime) {
	    this.prevTime += this.frameLen;
	    totalFrames++;
	  }

	  // Return amount of frames elapsed
	  return totalFrames;
 	};

	J.jumpStart(Framerate);
}(window.J));
