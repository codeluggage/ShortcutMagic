'use strict';
var $ = require('NodObjC');

$.import('Cocoa');
$.import('Foundation');

var sharedWorkspace = null; // NSWorkspace('allow', init)
var listener = $.NSObject.extend('listener');

listener.addMethod('listeningApplicationLaunched:', 'v@:@', function(self, _cmd, notification) {
    triggerAppSwitch(notification);
});

listener.addMethod('listeningApplicationActivated:', 'v@:@', function(self, _cmd, notification) {
    triggerAppSwitch(notification);
});

listener.register();

function triggerAppSwitch() {

    self.currentApplicationWindowName = [SWApplescriptManager windowNameOfApp:self.currentApplicationName];

}



var bridge = null;

module.export = function createListener() {
    // TODO: When to run this to be active throughout application lifetime, and not overwrite later? 
    $.NSRunLoop('mainRunLoop')('run');

    sharedWorkspace = NSWorkspace('sharedWorkspace');

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
