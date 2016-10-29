import { expect } from 'chai';
import Shortcuts from '../../app/reducers/Shortcuts';
import { INCREMENT_Shortcuts, DECREMENT_Shortcuts } from '../../app/actions/Shortcuts';


describe('reducers', () => {
  describe('Shortcuts', () => {
    it('should handle initial state', () => {
      expect(Shortcuts(undefined, {})).to.equal(0);
    });

    it('should handle INCREMENT_Shortcuts', () => {
      expect(Shortcuts(1, { type: INCREMENT_Shortcuts })).to.equal(2);
    });

    it('should handle DECREMENT_Shortcuts', () => {
      expect(Shortcuts(1, { type: DECREMENT_Shortcuts })).to.equal(0);
    });

    it('should handle unknown action type', () => {
      expect(Shortcuts(1, { type: 'unknown' })).to.equal(1);
    });
  });
});
