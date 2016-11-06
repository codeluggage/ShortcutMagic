'use strict';
var $ = require('NodObjC');
$.import('Cocoa');
$.import('Foundation');

var sharedWorkspace = null; // NSWorkspace('allow', init)
var listenerClass = $.NSObject.extend('listener');
var startedMainLoop = false;
var savedCallback = null;
var listenerObj = null;


function triggerAppSwitch(notification) {
    console.log('triggerAppSwitch with notification', notification);
    if (savedCallback) {
        // TOOD: Cast this better/safer
        savedCallback("" + sharedWorkspace('frontmostApplication')('localizedName'));
    } else {
        console.log('app switch triggered without callback');
    }
}

listenerClass.addMethod('listeningApplicationLaunched:', 'v@:@', function(self, _cmd, notification) {
    triggerAppSwitch(notification);
});

listenerClass.addMethod('listeningApplicationActivated:', 'v@:@', function(self, _cmd, notification) {
    triggerAppSwitch(notification);
});

listenerClass.register();
listenerObj = listenerClass('alloc')('init');

module.exports = function appSwitchListener(callback) {
    savedCallback = callback;
    if (!startedMainLoop) {

        sharedWorkspace = $.NSWorkspace('sharedWorkspace');

        sharedWorkspace('notificationCenter')('addObserver', listenerObj, 'selector', 'listeningApplicationLaunched:',
             'name', $.NSWorkspaceDidLaunchApplicationNotification, 'object', sharedWorkspace);

        sharedWorkspace('notificationCenter')('addObserver', listenerObj, 'selector', 'listeningApplicationActivated:',
             'name', $.NSWorkspaceDidActivateApplicationNotification, 'object', sharedWorkspace);


        $.NSRunLoop('mainRunLoop')('run');
        startedMainLoop = true;
        return true;
    }

    return false;
};
