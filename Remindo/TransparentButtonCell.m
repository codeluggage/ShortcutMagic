/*
     File: TransparentButtonCell.m 
 Abstract: This NSButtonCell subclass knows how to draw the button frame transparent, while
 the actual content stays non-transparent.  It does this by rendering the button
 into an NSImage, drawing the image with transparancy back into the control view,
 and then drawing the button contents again. 
  Version: 1.1 
  
 Disclaimer: IMPORTANT:  This Apple software is supplied to you by Apple 
 Inc. ("Apple") in consideration of your agreement to the following 
 terms, and your use, installation, modification or redistribution of 
 this Apple software constitutes acceptance of these terms.  If you do 
 not agree with these terms, please do not use, install, modify or 
 redistribute this Apple software. 
  
 In consideration of your agreement to abide by the following terms, and 
 subject to these terms, Apple grants you a personal, non-exclusive 
 license, under Apple's copyrights in this original Apple software (the 
 "Apple Software"), to use, reproduce, modify and redistribute the Apple 
 Software, with or without modifications, in source and/or binary forms; 
 provided that if you redistribute the Apple Software in its entirety and 
 without modifications, you must retain this notice and the following 
 text and disclaimers in all such redistributions of the Apple Software. 
 Neither the name, trademarks, service marks or logos of Apple Inc. may 
 be used to endorse or promote products derived from the Apple Software 
 without specific prior written permission from Apple.  Except as 
 expressly stated in this notice, no other rights or licenses, express or 
 implied, are granted by Apple herein, including but not limited to any 
 patent rights that may be infringed by your derivative works or by other 
 works in which the Apple Software may be incorporated. 
  
 The Apple Software is provided by Apple on an "AS IS" basis.  APPLE 
 MAKES NO WARRANTIES, EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION 
 THE IMPLIED WARRANTIES OF NON-INFRINGEMENT, MERCHANTABILITY AND FITNESS 
 FOR A PARTICULAR PURPOSE, REGARDING THE APPLE SOFTWARE OR ITS USE AND 
 OPERATION ALONE OR IN COMBINATION WITH YOUR PRODUCTS. 
  
 IN NO EVENT SHALL APPLE BE LIABLE FOR ANY SPECIAL, INDIRECT, INCIDENTAL 
 OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF 
 SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS 
 INTERRUPTION) ARISING IN ANY WAY OUT OF THE USE, REPRODUCTION, 
 MODIFICATION AND/OR DISTRIBUTION OF THE APPLE SOFTWARE, HOWEVER CAUSED 
 AND WHETHER UNDER THEORY OF CONTRACT, TORT (INCLUDING NEGLIGENCE), 
 STRICT LIABILITY OR OTHERWISE, EVEN IF APPLE HAS BEEN ADVISED OF THE 
 POSSIBILITY OF SUCH DAMAGE. 
  
 Copyright (C) 2011 Apple Inc. All Rights Reserved. 
  
 */


#import "TransparentButtonCell.h"

@implementation TransparentButtonCell

- (void)drawWithFrame:(NSRect)cellFrame inView:(NSView *)controlView
{
    NSImage *alphaImage;
    
    NSRect alphaImageRect = { NSZeroPoint, cellFrame.size };
    
    alphaImage = [[NSImage alloc] initWithSize:alphaImageRect.size];
    [alphaImage setFlipped:[controlView isFlipped]];
    [alphaImage lockFocus];
    
    BOOL wasEnabled = [self isEnabled];
    [self setEnabled:YES];
        // Draw the default button cell frame in the image
    [super drawWithFrame:alphaImageRect inView:controlView];
    [self setEnabled:wasEnabled];
    
    [alphaImage unlockFocus];

        // Draw the image with partial transparency into the control view
    [alphaImage drawAtPoint:cellFrame.origin fromRect:alphaImageRect operation:NSCompositeSourceOver fraction:0.75];
        // Draw the contents of the interior button image again, this time without transparency
    [self drawInteriorWithFrame:cellFrame inView:controlView];
    
    [alphaImage release];
}

@end
