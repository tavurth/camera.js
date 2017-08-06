/*
	camera.js v1.1
	http://github.com/idevelop/camera.js

	Author: Andrei Gheorghe (http://idevelop.github.com)
	License: MIT
*/

export default function camera() {
	let options;
	let renderTimer;

	this.initVideoStream = () => {
		this.video = document.createElement("video");
		this.video.setAttribute('width', options.width);
		this.video.setAttribute('height', options.height);

		navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
		window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;

		if (navigator.getUserMedia) {
			navigator.getUserMedia({
				video: true
			}, stream => {
				options.onSuccess();

				if (this.video.mozSrcObject !== undefined) { // hack for Firefox < 19
					this.video.mozSrcObject = stream;
				} else {
					this.video.src = (window.URL && window.URL.createObjectURL(stream)) || stream;
				}

				this.initCanvas();
			}, options.onError);
		} else {
			options.onNotSupported();
		}
	};

	this.initCanvas = () => {
		this.canvas = options.targetCanvas || document.createElement("canvas");
		this.canvas.setAttribute('width', options.width);
		this.canvas.setAttribute('height', options.height);

		this.context = this.canvas.getContext('2d');

		// mirror video
		if (options.mirror) {
			this.context.translate(this.canvas.width, 0);
			this.context.scale(-1, 1);
		}

		this.startCapture();
	};

	this.startCapture = () => {
		this.video.play();

		renderTimer = setInterval(() => {
			try {
				this.context.drawImage(this.video, 0, 0, this.video.width, this.video.height);
				options.onFrame(this.canvas);
			} catch (e) {
                // console.warn('Camera.JS: Failed to draw image to canvas');
			}
		}, Math.round(1000 / options.fps));
	};

	this.stopCapture = () => {
		this.pauseCapture();

		if (this.video.mozSrcObject !== undefined) {
			this.video.mozSrcObject = null;
		} else {
			this.video.src = "";
		}
	};

	this.pauseCapture = () => {
		if (renderTimer) clearInterval(renderTimer);
		this.video.pause();
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
