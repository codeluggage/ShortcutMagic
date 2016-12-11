'use strict';
var $ = require('NodObjC');
$.import('OSAKit');

module.exports = function executeMenuItem(appName, menuItem, menu) {
	var scriptName = "executeMenu";
	var encoding = $.NSUTF8StringEncoding;
	var dirName = $(`${__dirname}/${scriptName}.scpt`);
	var source = $.NSString('stringWithContentsOfFile', dirName, 'encoding', encoding, 'error', null);
	var hold = $.OSAScript('alloc')('initWithSource', source);

	// TODO: How to make this a useable pointer? http://tootallnate.github.io/$/class.html -> createPointer ?
	// NSDictionary<NSString *,id> *errorInfo;
	var errorInfo = $.alloc($.NSDictionary);
	var compiled = hold('compileAndReturnError', errorInfo.ref());

	if (!compiled) {
	    $.NSLog("Compile failed: %@", errorInfo);
	    return null;
	}

	var arrayArgs = $.NSMutableArray('alloc')('init');
	arrayArgs('addObject', $(appName));
	arrayArgs('addObject', $(menuItem));
	arrayArgs('addObject', $(menu));

	hold('executeHandlerWithName', $(scriptName), 'arguments', arrayArgs, 'error', errorInfo.ref());
};
