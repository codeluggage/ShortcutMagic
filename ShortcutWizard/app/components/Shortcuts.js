// @flow
import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import styles from './Shortcuts.css';

class Shortcuts extends Component {
  static propTypes = {
    increment: PropTypes.func.isRequired,
    incrementIfOdd: PropTypes.func.isRequired,
    incrementAsync: PropTypes.func.isRequired,
    decrement: PropTypes.func.isRequired,
    Shortcuts: PropTypes.number.isRequired
  };

  render() {
    const { increment, incrementIfOdd, incrementAsync, decrement, Shortcuts } = this.props;
    return (
      <div>
        <div className={styles.backButton}>
          <Link to="/">
            <i className="fa fa-arrow-left fa-3x" />
          </Link>
        </div>
        <div className={`Shortcuts ${styles.Shortcuts}`}>
          {Shortcuts}
        </div>
      </div>
    );
  }
}

export default Shortcuts;
