@import Foundation;
@import CoreData;

@interface SWShortcutWizard : NSManagedObject

@property float magnitude;
@property NSString *placeName;
@property NSDate *time;
@property float longitude;
@property float latitude;
@property float depth;
@property NSString *detailURL;
@property NSString *code;

- (void)updateFromDictionary:(NSDictionary *)shortcutDictionary;

@end
