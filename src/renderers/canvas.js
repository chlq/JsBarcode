import merge from "../help/merge.js";
import {calculateEncodingAttributes, getTotalWidthOfEncodings, getMaximumHeightOfEncodings} from "./shared.js";

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
		ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		if(this.options.background){
			ctx.fillStyle = this.options.background;
			ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
		}

		ctx.translate(this.options.marginLeft, 0);
	}

	drawCanvasBarcode(options, encoding){
		// Get the canvas context
		var ctx = this.canvas.getContext("2d");

		var binary = encoding.data;

		// Creates the barcode out of the encoded binary
		var yFrom;
		if(options.textPosition == "top"){
			yFrom = options.marginTop + options.fontSize + options.textMargin;
		}
		else{
			yFrom = options.marginTop;
		}

		ctx.fillStyle = options.lineColor;

		for(var b = 0; b < binary.length; b++){
			var x = b * options.width + encoding.barcodePadding;

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

		var tailFont = options.tailsFontOptions + " " + options.tailsFontSize + "px " + options.font;

		// Draw the text if displayValue is set
		if(options.displayValue){
			var x, y, tx, ty;
			let alen = encoding.text.length - parseInt(options.tailsCount);
			let aText = encoding.text.slice(0, alen) //获取前半部分文字
			let tText = encoding.text.slice(alen)    //获取后半部分

			if(options.textPosition == "top"){
				y = options.marginTop + options.fontSize - options.textMargin;
				ty = options.marginTop + options.tailsFontSize - options.textMargin;
			}
			else{
				y = options.height + options.textMargin + options.marginTop + options.fontSize;
				ty = options.height + options.textMargin + options.marginTop + options.tailsFontSize;
			}

			ctx.font = font;
			let aTextWidth = ctx.measureText(aText).width;
			ctx.font = tailFont;
			let tTextWidth = ctx.measureText(tText).width;

			// Draw the text in the correct X depending on the textAlign option
			if(options.textAlign == "left" || encoding.barcodePadding > 0){
				x = 0;
				tx = aTextWidth;
				ctx.textAlign = 'left';
			}
			else if(options.textAlign == "right"){
				tx = encoding.width - 1;
				x = tx - tTextWidth;
				ctx.textAlign = 'right';
			}
			// In all other cases, center the text
			else{
				x = Math.floor((encoding.width - tTextWidth) / 2);
				x = x>0?x:0;
				tx = x+Math.ceil(aTextWidth/2);
				ctx.textAlign = 'center';
			}
			console.log('(x,y): (%d,%d)',x,y)
			console.log('(tx,ty): (%d,%d)',tx,ty)

			if(options.tailsCount > 0) {
				ctx.font = font;
				ctx.fillText(aText, x, y); //绘制前半部分
				ctx.font = tailFont;
				ctx.textAlign = 'left';
				ctx.fillText(tText, tx, ty);
			}else {
				ctx.font = font;
				ctx.fillText(encoding.text, x, y);
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
