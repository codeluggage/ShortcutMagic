/*
 Copyright (C) 2016 Apple Inc. All Rights Reserved.
 See LICENSE.txt for this sample’s licensing information
 
 Abstract:
 Singleton controller to manage the main Core Data stack for the application. It vends a persistent store coordinator, and for convenience the managed object model and URL for the persistent store and application documents directory.
 */

@import Cocoa;

@interface SWCoreDataStackManager : NSObject

+ (instancetype)sharedManager;

// Main queue context
@property (nonatomic, readonly) NSManagedObjectContext *mainQueueContext;

// Utility method to create a private queue context with its own PSC.
- (NSManagedObjectContext *)newPrivateQueueContextWithNewPSC:(NSError * __autoreleasing *)error;



@end

