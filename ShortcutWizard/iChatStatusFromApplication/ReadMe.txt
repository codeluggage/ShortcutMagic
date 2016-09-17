iChatStatusFromApplication
==========================

ABOUT:

"iChatStatusFromApplication" demonstrates how to use the Scripting Bridge framework to communicate with iChat. It uses the Accessibility API to listen for frontmost application change events, then uses the scripting bridge to set the user's status message and icon to represent what application they are currently using. The user's status message is set to "Using Safari" if Safari is the frontmost application, for example.  It also presents the user with a "Join Chat" button that, when clicked, uses the scripting bridge to ask iChat to join a specific AIM chat room ("ichatstatus").  You could use this or similar techniques to, for example, allow users of an application to join a discussion or support AIM chat room for that app.

"iChatStatusFromApplication" requires that "Enable access for assistive devices" be enabled in your Universal Access preferences in order to listen for active-application-changed events. It is worth noting that turning on "Enable access for assistive devices" is not a requirement for using the Scripting Bridge framework with iChat.


SETUP:

1. Create a new project.
"iChatStatusFromApplication" is a Cocoa application. Open Xcode, choose File > New Project and select Cocoa Application under application in the New Project Assistant window. Click Next and save the project as iChatStatusFromApplication.

2. Add the Scripting Bridge framework to your project.
Open the Build Phases tab of your target and expand the Link Binary With Libraries section.  Click the + button and search for ScriptingBridge.Framework.  Select it and hit OK.

3. Create iChat header file
Open the Terminal application and run the following command:
		sdef /Applications/iChat.app | sdp -fh --basename iChat

You should see an iChat.h file in your working directory. Drag and drop iChat.h into the Other Sources group in your Xcode project window. Check "Copy items into destination group's folder (if needed)" in the ensuing dialog. 

4. Create the ISFAController’s class files
Select File > New File and click Objective-C class under Cocoa in the New File Assistant window. Name the file ISFAController and check the "Also create..." checkbox if unchecked. 

5. Add the iChat header and define a scripting bridge object in the ISFAController.h file. See the ISFAController.h  file in this sample for its implementation.

6. Add Scripting Bridge to the code 
the "joinChatRoom" method in the ISFAController.m file describes how to use the Scripting Bridge to communicate with iChat.

7. Add code to watch for application switch events 
The "registerForAppSwitchNotificationFor" method in the ISFAController.m file describes how to watch for an application switch events. It uses an accessibility observer to pay attention to an application switch events.

8. Add code to update the current status and icon of users
The "applicationSwitched" method in the ISFAController.m file refreshes the current status and icon of users in iChat and "iChatStatus" window.

9. Build and run the sample
Click the Build and Go toolbar item in the project window to compile and run the sample. 


Using the Sample 
Turn on the "Enable access for assistive devices" (if disabled) in your Universal Access preferences.

Switch to another application to see your status message and icon changed to your frontmost application's name and icon. 
Click the "Join Chat Room" button to join the "ichatstatus" AIM chat room in iChat. iChat will join the chat room in the same way as if you had selected to do so manually within iChat, so all normal actions will then work - for example, you can show/hide the participants drawer using the View < Show/Hide Chat Participants menu item, click the "+" button in the drawer to invite and add a user to the chat room. 



===========================================================================
BUILD REQUIREMENTS

Xcode 3.2, Mac OS X 10.6 Snow Leopard or later.

===========================================================================
RUNTIME REQUIREMENTS

Mac OS X 10.6 Snow Leopard or later.

===========================================================================
CHANGES FROM PREVIOUS VERSIONS

Version 1.2
- Project updated for Xcode 4.
Version 1.1
- Updated sample to work with released Leopard instead of WWDC 2007 Leopard Beta.
- Check if the "Enable access for assistive devices" feature is turned on and warn users if it is not.
Version 1.0
- Initial Version

===========================================================================
Copyright (C) 2008-2011 Apple Inc. All rights reserved.