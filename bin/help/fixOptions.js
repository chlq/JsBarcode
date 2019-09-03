'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = fixOptions;


function fixOptions(options) {
	// Fix the margins
	options.marginTop = options.marginTop || options.margin;
	options.marginBottom = options.marginBottom || options.margin;
	options.marginRight = options.marginRight || options.margin;
	options.marginLeft = options.marginLeft || options.margin;
	return options;
}

function fixTextOpts(encoding) {
	var options = encoding.options;
	if (typeof options.textOpts === 'undefined' || !Array.isArray(options.textOpts) || options.textOpts.length === 0) {
		options.textOpts = [{
			font: options.font,
			fontSize: options.Size,
			fontOptions: options.fontOptions,
			text: encoding.text
		}];
	} else {
		for (var i = 0; i < options.textOpts.length; i++) {
			options.textOpts[i].text = options.textOpts[i].text || encoding.text;
		}
	}
}

exports.fixOptions = fixOptions;
exports.fixTextOpts = fixTextOpts;