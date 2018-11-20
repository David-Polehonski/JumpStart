/*
	Simple Animation Function for chaining `requestAnimationFrame` calls.
	J.animate(
		function() {
			// Do the first thing
		}
	).then(
		function( PriorStepReturnValue ) {
			// Do the next thing
		}	
	)
*/
(function () {
	'use strict';
	var run = function (animationStep, animationDelay) {
		
		var animationDelay = animationDelay || 0;
		var animationStep = animationStep.bind(step);
	
		return new Promise(function (thisStep, thisDelay, resolve, reject) {
			var resolveWithNextStep = step(resolve);
			var closure = function () {
				try {
					resolveWithNextStep( thisStep() );
				} catch (e) {
					reject( e );
				}
			};
		
			if (thisDelay == 0) {
				requestAnimationFrame( closure );
			} else {
				setTimeout(function () { requestAnimationFrame( closure ); }, thisDelay);
			}
				
		}.bind(null, animationStep, animationDelay));
	};

	var step = function (animationStep, animationDelay) {
		var animationStep = animationStep || function (){};
		var animationDelay = animationDelay || 0;
		
		return run.bind(null, animationStep, animationDelay);
	}
	
	J.animate = run;
}());