/*
 Copyright (C) 2016 Apple Inc. All Rights Reserved.
 See LICENSE.txt for this sample’s licensing information
 
 Abstract:
 View controller to manage a a table view that displays a collection of shortcuts.
 
  When requested (by clicking the Fetch ShortcutWizards button), the controller creates an asynchronous NSURLSession task to retrieve JSON data about earthshortcuts. Earthquake data are compared with any existing managed objects to determine whether there are new shortcuts. New managed objects are created to represent new data, and saved to the persistent store on a private queue.
 */

@import Cocoa;

@interface SWShortcutWizardsViewController : NSViewController
@end
