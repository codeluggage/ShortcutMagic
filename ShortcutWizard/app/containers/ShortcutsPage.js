// @flow
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Shortcuts from '../components/Shortcuts';
import * as ShortcutsActions from '../actions/Shortcuts';

function mapStateToProps(state) {
  return {
    Shortcuts: state.Shortcuts
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(ShortcutsActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Shortcuts);
