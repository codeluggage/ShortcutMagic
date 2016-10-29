/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import { spy } from 'sinon';
import * as actions from '../../app/actions/Shortcuts';


describe('actions', () => {
  it('should increment should create increment action', () => {
    expect(actions.increment()).to.deep.equal({ type: actions.INCREMENT_Shortcuts });
  });

  it('should decrement should create decrement action', () => {
    expect(actions.decrement()).to.deep.equal({ type: actions.DECREMENT_Shortcuts });
  });

  it('should incrementIfOdd should create increment action', () => {
    const fn = actions.incrementIfOdd();
    expect(fn).to.be.a('function');
    const dispatch = spy();
    const getState = () => ({ Shortcuts: 1 });
    fn(dispatch, getState);
    expect(dispatch.calledWith({ type: actions.INCREMENT_Shortcuts })).to.be.true;
  });

  it('should incrementIfOdd shouldnt create increment action if Shortcuts is even', () => {
    const fn = actions.incrementIfOdd();
    const dispatch = spy();
    const getState = () => ({ Shortcuts: 2 });
    fn(dispatch, getState);
    expect(dispatch.called).to.be.false;
  });

  // There's no nice way to test this at the moment...
  it('should incrementAsync', done => {
    const fn = actions.incrementAsync(1);
    expect(fn).to.be.a('function');
    const dispatch = spy();
    fn(dispatch);
    setTimeout(() => {
      expect(dispatch.calledWith({ type: actions.INCREMENT_Shortcuts })).to.be.true;
      done();
    }, 5);
  });
});
