import merge from "../help/merge.js";

function getEncodingHeight(encoding, options){
	let height = options.fontSize;
	if(typeof options.textOpts !== 'undefined') {
		if(Array.isArray(options.textOpts)) {
			if(options.textOpts.length > 0) {
				for(let i = 0; i < options.textOpts.length; i++)  {
					let textOpt = options.textOpts[i]
					if(typeof textOpt.text !== "undefined" && textOpt.text.length > 0) {
						textOpt.height = textOpt.fontSize ||options.fontSize
						height = Math.max(textOpt.height, height);
					}else {
						textOpt.height = 0
					}
				}
			}
		}
	}

	return options.height +
		((options.displayValue && encoding.text.length > 0) ? height + options.textMargin : 0) +
		options.marginTop +
		options.marginBottom;
}

function getBarcodePadding(textWidth, barcodeWidth, options){
	if(options.displayValue && barcodeWidth < textWidth){
		if(options.textAlign == "center"){
			return Math.floor((textWidth - barcodeWidth) / 2);
		}
		else if(options.textAlign == "left"){
			return 0;
		}
		else if(options.textAlign == "right"){
			return Math.floor(textWidth - barcodeWidth);
		}
	}
	return 0;
}

function calculateEncodingAttributes(encodings, barcodeOptions, context){
	for(let i = 0; i < encodings.length; i++){
		var encoding = encodings[i];
		var options = merge(barcodeOptions, encoding.options);

		// Calculate the width of the encoding
		var textWidth;
		if(options.displayValue){
			textWidth = messureText(encoding.text, options, context);
		}
		else{
			textWidth = 0;
		}

		var barcodeWidth = encoding.data.length * options.width;
		encoding.width =  Math.ceil(Math.max(textWidth, barcodeWidth));

		encoding.height = getEncodingHeight(encoding, options);

		encoding.barcodePadding = getBarcodePadding(textWidth, barcodeWidth, options);
	}
}

function getTotalWidthOfEncodings(encodings){
	var totalWidth = 0;

	for(let i = 0; i < encodings.length; i++){
		totalWidth += encodings[i].width;
	}
	return totalWidth;
}

function getMaximumHeightOfEncodings(encodings){
	var maxHeight = 0;
	for(let i = 0; i < encodings.length; i++){
		if(encodings[i].height > maxHeight){
			maxHeight = encodings[i].height;
		}
	}
	return maxHeight;
}

function messureText(textOpts, context){
	var ctx;

	if(context){
		ctx = context;
	}
	else if(typeof document !== "undefined"){
		ctx = document.createElement("canvas").getContext("2d");
	}
	else{
		// If the text cannot be messured we will return 0.
		// This will make some barcode with big text render incorrectly
		return 0;
	}
	let width = 0
	// Calculate the width of the encoding
	if(typeof options.textOpts !== 'undefined') {
		if(Array.isArray(options.textOpts)) {
			if(options.textOpts.length > 0) {
				for(let i = 0; i < options.textOpts.length; i++)  {
					let textOpt = options.textOpts[i]
					if(typeof textOpt.text !== "undefined" && textOpt.text.length > 0) {
						textOpt.fontOptions = textOpt.fontOptions || '';
						textOpt.fontSize = textOpt.fontSize || options.fontSize;
						textOpt.font = textOpt.font || options.font;
						ctx.font = textOpt.fontOptions + " " + textOpt.fontSize + "px " + textOpt.font;
						textOpt.width = ctx.measureText(textOpt.text).width;
						textOpt.leftWidth = width
					}else {
						textOpt.width = 0;
						textOpt.leftWidth = width
					}
					width += textOpt.width
				}
			}
		}
		return width;
	}else {
		ctx.font = options.fontOptions + " " + options.fontSize + "px " + options.font;
		return ctx.measureText(string).width
	}
}

function calculateLocationsOfText(options, encoding, context) {
	let ctx = context;
	if(typeof options.textOpts !== 'undefined' && Array.isArray(options.textOpts) && options.textOpts.length > 0) {
		let maxWidth = options.textOpts[options.textOpts.length-1].leftWidth + options.textOpts[options.textOpts.length-1].width || encoding.width
		for(let i = 0; i < options.textOpts.length; i++) {
			let textOpt = options.textOpts[i];
			let x = 0, y = 0;
			if(options.textPosition == "top"){
				y = options.marginTop + textOpt.fontSize - options.textMargin;
			}
			else{
				y = options.height + options.textMargin + options.marginTop + textOpt.fontSize;
			}

			// Draw the text in the correct X depending on the textAlign option
			if(options.textAlign == "left" || encoding.barcodePadding > 0){
				x = textOpt.leftWidth;
				ctx.textAlign = 'left';
			}
			else if(options.textAlign == "right"){
				x = encoding.width - textOpt.leftWidth - 1;
				ctx.textAlign = 'right';
			}
			// In all other cases, center the text
			else{
				x = Math.floor((encoding.width - maxWidth) / 2 + textOpt.leftWidth);
				ctx.textAlign = 'left';
			}
			textOpt.x = x;
			textOpt.y = y;
		}

	}
}

export {getMaximumHeightOfEncodings, getEncodingHeight, getBarcodePadding, calculateEncodingAttributes, getTotalWidthOfEncodings,calculateLocationsOfText};
