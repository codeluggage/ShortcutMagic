'use strict';
var $ = require('NodObjC');

$.import('Cocoa');
$.import('Foundatio');


var listener = null; // turn into object of a class that can listen
var sharedWorkspace = null;

// TODO: turn into listeners
var listeningApplicationLaunched = function() {

}
var listeningApplicationActivated = function() {

}

var bridge = null;

module.export = function createListener() {

    sharedWorkspace('notificationCenter')('addObserver', listener, 

        // TODO: how to do selector?
         'selector', @selector(listeningApplicationLaunched:),

         name:$.NSWorkspaceDidLaunchApplicationNotification,

     'object', sharedWorkspace);

    sharedWorkspace('notificationCenter')('addObserver', listener, 
        // TODO: how to do selector?
         selector:@selector(listeningApplicationActivated:),

         name: $.NSWorkspaceDidActivateApplicationNotification,

     'object', sharedWorkspace);
};
