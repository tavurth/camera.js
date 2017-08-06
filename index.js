/*
	camera.js v1.1
	http://github.com/idevelop/camera.js

	Author: Andrei Gheorghe (http://idevelop.github.com)
	License: MIT
*/

export default function camera() {
	let options;
	let video, canvas, context;
	let renderTimer;

	this.initVideoStream() => {
		video = document.createElement("video");
		video.setAttribute('width', options.width);
		video.setAttribute('height', options.height);

		navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
		window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;

		if (navigator.getUserMedia) {
			navigator.getUserMedia({
				video: true
			}, stream => {
				options.onSuccess();

				if (video.mozSrcObject !== undefined) { // hack for Firefox < 19
					video.mozSrcObject = stream;
				} else {
					video.src = (window.URL && window.URL.createObjectURL(stream)) || stream;
				}

				this.initCanvas();
			}, options.onError);
		} else {
			options.onNotSupported();
		}
	};

	this.initCanvas = () => {
		canvas = options.targetCanvas || document.createElement("canvas");
		canvas.setAttribute('width', options.width);
		canvas.setAttribute('height', options.height);

		context = canvas.getContext('2d');

		// mirror video
		if (options.mirror) {
			context.translate(canvas.width, 0);
			context.scale(-1, 1);
		}

		this.startCapture();
	};

	this.startCapture = () => {
		video.play();

		renderTimer = setInterval(() => {
			try {
				context.drawImage(video, 0, 0, video.width, video.height);
				options.onFrame(canvas);
			} catch (e) {
                console.warn('Camera.JS: Failed to draw image to canvas');
			}
		}, Math.round(1000 / options.fps));
	};

	this.stopCapture = () => {
		this.pauseCapture();

		if (video.mozSrcObject !== undefined) {
			video.mozSrcObject = null;
		} else {
			video.src = "";
		}
	};

	this.pauseCapture = () => {
		if (renderTimer) clearInterval(renderTimer);
		video.pause();
	};

	return {
		init: captureOptions => {
			let doNothing = () => {};

			options = captureOptions || {};

			options.fps = options.fps || 30;
			options.width = options.width || 640;
			options.height = options.height || 480;
			options.mirror = options.mirror || false;
			options.targetCanvas = options.targetCanvas || null; // TODO: is the element actually a <canvas> ?

			options.onSuccess = options.onSuccess || doNothing;
			options.onError = options.onError || doNothing;
			options.onNotSupported = options.onNotSupported || doNothing;
			options.onFrame = options.onFrame || doNothing;

			this.initVideoStream();

            return this;
		},

		stop: this.stopCapture,
		pause: this.pauseCapture,
		start: this.startCapture
	};
};
