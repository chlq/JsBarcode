import merge from "../help/merge.js";
import {calculateEncodingAttributes, getTotalWidthOfEncodings, getMaximumHeightOfEncodings, calculateLocationsOfText} from "./shared.js";

class CanvasRenderer{
	constructor(canvas, encodings, options){
		this.canvas = canvas;
		this.encodings = encodings;
		this.options = options;
	}

	render(){
		// Abort if the browser does not support HTML5 canvas
		if (!this.canvas.getContext) {
			throw new Error('The browser does not support canvas.');
		}
		this.prepareCanvas();
		for(let i = 0; i < this.encodings.length; i++){
			var encodingOptions = merge(this.options, this.encodings[i].options);

			this.drawCanvasBarcode(encodingOptions, this.encodings[i]);
			this.drawCanvasText(encodingOptions, this.encodings[i]);

			this.moveCanvasDrawing(this.encodings[i]);
		}

		this.restoreCanvas();
	}

	prepareCanvas(){
		// Get the canvas context
		var ctx = this.canvas.getContext("2d");

		ctx.save();

		calculateEncodingAttributes(this.encodings, this.options, ctx);
		var totalWidth = getTotalWidthOfEncodings(this.encodings);
		var maxHeight = getMaximumHeightOfEncodings(this.encodings);

		this.canvas.width = totalWidth + this.options.marginLeft + this.options.marginRight;

		this.canvas.height = maxHeight;

		// Paint the canvas
		ctx.clearRect(this.options.x, this.options.y, this.canvas.width, this.canvas.height);
		if(this.options.background){
			ctx.fillStyle = this.options.background;
			ctx.fillRect(this.options.x, this.options.y, this.canvas.width, this.canvas.height);
		}

		ctx.translate(this.options.marginLeft, this.options.y);
	}

	drawCanvasBarcode(options, encoding){
		// Get the canvas context
		var ctx = this.canvas.getContext("2d");

		var binary = encoding.data;

		// Creates the barcode out of the encoded binary
		var yFrom;
		if(options.textPosition == "top"){
			yFrom = options.marginTop + options.fontSize + options.textMargin + options.y;
		}
		else{
			yFrom = options.marginTop + options.y;
		}

		ctx.fillStyle = options.lineColor;

		for(var b = 0; b < binary.length; b++){
			var x = b * options.width + encoding.barcodePadding + options.x;

			if(binary[b] === "1"){
				ctx.fillRect(x, yFrom, options.width, options.height);
			}
			else if(binary[b]){
				ctx.fillRect(x, yFrom, options.width, options.height * binary[b]);
			}
		}
	}

	drawCanvasText(options, encoding){
		// Get the canvas context
		var ctx = this.canvas.getContext("2d");

		var font = options.fontOptions + " " + options.fontSize + "px " + options.font;

		// Draw the text if displayValue is set
		if(options.displayValue){
			calculateLocationsOfText(options, encoding, ctx);
			if(typeof options.textOpts !== 'undefined' && Array.isArray(options.textOpts) && options.textOpts.length > 0) {
				for(let i = 0; i < options.textOpts.length; i++) {
					let textOpt = options.textOpts[i]
					let x = textOpt.x || 0
					let y = textOpt.y || 0
					let text = textOpt.text
					ctx.font = textOpt.fontOptions + " " + textOpt.fontSize + "px " + textOpt.font;
					ctx.fillText(text, x, y)
				}
			}
		}
	}


	moveCanvasDrawing(encoding){
		var ctx = this.canvas.getContext("2d");

		ctx.translate(encoding.width, 0);
	}

	restoreCanvas(){
		// Get the canvas context
		var ctx = this.canvas.getContext("2d");

		ctx.restore();
	}
}

export default CanvasRenderer;
