import React from "react";
import { wrapDisplayName, shallowEqual } from "recompose";
import { once, isPlainObject } from "lodash";

/* always thought react-motion is cool, this is my attempt to kinda replicate it */

class Timeline {
  constructor() {
    this._tid = null;
    this._currentListeners = [];
    this._nextListeners = this._currentListeners;
  }
  start() {
    if (!this._tid) {
      this._tid = requestAnimationFrame(this.run);
    }
    return this;
  }
  run = () => {
    this._currentListeners = this._nextListeners;
    this._tid = requestAnimationFrame(this.run);
    const listeners = this._currentListeners;
    for (let i = 0; i < listeners.length; i++) {
      this._currentListeners[i]();
    }
    if (!listeners.length) {
      this.stop();
    }
  };
  stop() {
    this._tid && cancelAnimationFrame(this._tid);
    this._tid = null;
    return this;
  }
  _ensureCanMutateNextListeners() {
    if (this._nextListeners === this._currentListeners) {
      this._nextListeners = this._currentListeners.slice();
    }
  }
  onEnterFrame(cb) {
    this._ensureCanMutateNextListeners();
    this._nextListeners.push(cb);
    const offEnterFrame = once(() => {
      this._ensureCanMutateNextListeners();
      const index = this._nextListeners.indexOf(cb);
      this._nextListeners.splice(index, 1);
    });
    this.start();
    return offEnterFrame;
  }
}

class AnimationProvider extends React.Component {
  static childContextTypes = {
    timeline: React.PropTypes.instanceOf(Timeline)
  };
  getChildContext() {
    return {
      timeline: new Timeline()
    };
  }
  render() {
    return this.props.children;
  }
}

const withAnimation = interpolate =>
  WrappedComponent => {
    const completed = {
      next: () => ({ done: true, value: undefined })
    };
    const throwPropsError = props => {
      if (!isPlainObject(props)) {
        throw Error("Animated Components must have plain object props");
      }
    };

    class Animated extends React.Component {
      static displayName = wrapDisplayName(WrappedComponent, "withAnimation");
      static contextTypes = {
        timeline: React.PropTypes.instanceOf(Timeline).isRequired
      };
      constructor(props) {
        super(props);
        throwPropsError(props);
        this.state = props;
        this.nextFrame = completed;
      }
      componentWillReceiveProps(nextProps) {
        throwPropsError(nextProps);
        if (shallowEqual(this.props, nextProps)) {
          return;
        }
        this.nextFrame = interpolate(this.state, nextProps);
        const unlisten = this.context.timeline.onEnterFrame(() => {
          const { done, value } = this.nextFrame.next();
          if (done) {
            this.nextFrame = completed;
            unlisten();
          } else {
            try {
              throwPropsError(value);
              this.setState(value);
            } catch (err) {
              unlisten();
              throw err;
            }
          }
        });
      }
      componentWillUnmount() {
        this.nextFrame = completed;
      }
      render() {
        return <WrappedComponent {...this.state} />;
      }
    }
    return Animated;
  };

export { AnimationProvider };
export default withAnimation;
