"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.getMaxFontSize = exports.calculateLocationsOfText = exports.getTotalWidthOfEncodings = exports.calculateEncodingAttributes = exports.getBarcodePadding = exports.getEncodingHeight = exports.getMaximumHeightOfEncodings = undefined;

var _merge = require("../help/merge.js");

var _merge2 = _interopRequireDefault(_merge);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getEncodingHeight(encoding, options) {
	var height = getMaxFontSize(options);
	return options.height + (options.displayValue && encoding.text.length > 0 ? height + options.textMargin : 0) + options.marginTop + options.marginBottom;
}

function getMaxFontSize(options) {
	var maxFontSize = options.fontSize;
	if (typeof options.textOpts !== 'undefined') {
		if (Array.isArray(options.textOpts) && options.textOpts.length > 0) {
			for (var i = 0; i < options.textOpts.length; i++) {
				var textOpt = options.textOpts[i];
				if (typeof textOpt.text !== "undefined" && textOpt.text.length > 0) {
					textOpt.fontSize = textOpt.fontSize || options.fontSize || 20;
					maxFontSize = Math.max(textOpt.fontSize, maxFontSize);
				}
			}
		}
	}
	return maxFontSize;
}

function getMinFontSize(options) {
	var minFontSize = options.fontSize;
	if (typeof options.textOpts !== 'undefined') {
		if (Array.isArray(options.textOpts) && options.textOpts.length > 0) {
			for (var i = 0; i < options.textOpts.length; i++) {
				var textOpt = options.textOpts[i];
				if (typeof textOpt.text !== "undefined" && textOpt.text.length > 0) {
					textOpt.fontSize = textOpt.fontSize || options.fontSize || 20;
					minFontSize = Math.min(textOpt.fontSize, minFontSize);
				}
			}
		}
	}
	return minFontSize;
}

function getBarcodePadding(textWidth, barcodeWidth, options) {
	if (options.displayValue && barcodeWidth < textWidth) {
		if (options.textAlign == "center") {
			return Math.floor((textWidth - barcodeWidth) / 2);
		} else if (options.textAlign == "left") {
			return 0;
		} else if (options.textAlign == "right") {
			return Math.floor(textWidth - barcodeWidth);
		}
	}
	return 0;
}

function calculateEncodingAttributes(encodings, barcodeOptions, context) {
	for (var i = 0; i < encodings.length; i++) {
		var encoding = encodings[i];
		var options = (0, _merge2.default)(barcodeOptions, encoding.options);

		// Calculate the width of the encoding
		var textWidth;
		if (options.displayValue) {
			textWidth = messureText(encoding.text, options, context);
		} else {
			textWidth = 0;
		}

		var barcodeWidth = encoding.data.length * options.width;

		encoding.width = Math.ceil(Math.max(textWidth, barcodeWidth));

		encoding.height = getEncodingHeight(encoding, options);

		encoding.barcodePadding = getBarcodePadding(textWidth, barcodeWidth, options);
	}
}

function getTotalWidthOfEncodings(encodings) {
	var totalWidth = 0;

	for (var i = 0; i < encodings.length; i++) {
		totalWidth += encodings[i].width;
	}
	return totalWidth;
}

function getMaximumHeightOfEncodings(encodings) {
	var maxHeight = 0;
	for (var i = 0; i < encodings.length; i++) {
		if (encodings[i].height > maxHeight) {
			maxHeight = encodings[i].height;
		}
	}
	return maxHeight;
}

function messureText(string, options, context) {
	var ctx;

	if (context) {
		ctx = context;
	} else if (typeof document !== "undefined" && typeof options.textOpts !== 'undefined') {
		ctx = document.createElement("canvas").getContext("2d");
	} else {
		// If the text cannot be messured we will return 0.
		// This will make some barcode with big text render incorrectly
		return 0;
	}
	var width = 0;
	// Calculate the width of the encoding
	if (Array.isArray(options.textOpts)) {
		if (options.textOpts.length > 0) {
			for (var i = 0; i < options.textOpts.length; i++) {
				var textOpt = options.textOpts[i];
				if (typeof textOpt.text !== "undefined" && textOpt.text.length > 0) {
					textOpt.fontOptions = textOpt.fontOptions || '';
					textOpt.fontSize = textOpt.fontSize || options.fontSize;
					textOpt.font = textOpt.font || options.font;
					ctx.font = textOpt.fontOptions + " " + textOpt.fontSize + "px " + textOpt.font;
					textOpt.width = Math.ceil(ctx.measureText(textOpt.text).width);
					textOpt.leftWidth = width;
				} else {
					textOpt.width = 0;
					textOpt.leftWidth = width;
				}
				width += textOpt.width;
			}
		}
	}
	return Math.ceil(width);
}

function calculateLocationsOfText(options, encoding) {
	if (typeof options.textOpts !== 'undefined' && Array.isArray(options.textOpts) && options.textOpts.length > 0) {
		var sumWidth = 0;
		for (var i = 0; i < options.textOpts.length; i++) {
			var textOpt = options.textOpts[i];
			if (typeof textOpt.text !== "undefined" && textOpt.text.length > 0) {
				sumWidth += textOpt.width;
			}
		}

		for (var _i = 0; _i < options.textOpts.length; _i++) {
			var _textOpt = options.textOpts[_i];
			var x = 0,
			    y = 0;
			if (options.textPosition == "top") {
				y = options.marginTop + options.maxFontSize - options.textMargin;
			} else {
				y = options.height + options.textMargin + options.marginTop + _textOpt.fontSize;
			}

			// Draw the text in the correct X depending on the textAlign option
			if (options.textAlign == "left" || encoding.barcodePadding > 0) {
				x = _textOpt.leftWidth;
			} else if (options.textAlign == "right") {
				x = encoding.width - _textOpt.leftWidth - 1;
			}
			// In all other cases, center the text
			else {
					x = Math.floor((encoding.width + _textOpt.width - sumWidth) / 2 + _textOpt.leftWidth);
				}
			_textOpt.x = x + options.x;
			_textOpt.y = y + options.y;
		}
	}
}

exports.getMaximumHeightOfEncodings = getMaximumHeightOfEncodings;
exports.getEncodingHeight = getEncodingHeight;
exports.getBarcodePadding = getBarcodePadding;
exports.calculateEncodingAttributes = calculateEncodingAttributes;
exports.getTotalWidthOfEncodings = getTotalWidthOfEncodings;
exports.calculateLocationsOfText = calculateLocationsOfText;
exports.getMaxFontSize = getMaxFontSize;