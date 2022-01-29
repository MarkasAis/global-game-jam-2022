import Maths from "../math/maths.js";

export default class Timer {
    constructor(updatesPerSecond, updateCallback, renderCallback, timeScale=1) {
        this._updatesPerSecond = updatesPerSecond;
        this._updateCallback = updateCallback;
        this._renderCallback = renderCallback;

        this.timeScale = timeScale;

        this._lastUpdateTime = null;

        this._transitionTimeStart = null;
        this._transitionTimeEnd = null;
        this._transitionValueStart = null;
        this._transitionValueEnd = null;
        this._transitionEndCallback = null;
        this._isTransitioning = false;
    }

    start() {
        this._lastUpdateTime = null;
        this._onUpdate();
        this._updateIntervalID = setInterval(() => { this._onUpdate(); }, 1000 / this._updatesPerSecond);
        this._renderFrameID = requestAnimationFrame(() => { this._onRender(); });
    }

    stop() {
        clearTimeout(this._updateIntervalID);
        cancelAnimationFrame(this._renderFrameID);
    }

    transitionTimescale(timescale, duration=1, endCallback) {
        this._transitionTimeStart = Date.now() / 1000;
        this._transitionTimeEnd = this._transitionTimeStart + duration;
        this._transitionValueStart = this.timeScale;
        this._transitionValueEnd = timescale;
        this._transitionEndCallback = endCallback;
        this._isTransitioning = true;
    }

    _onUpdate() {
        let time = Date.now() / 1000;
        let deltatime = this._lastUpdateTime != null ? (time - this._lastUpdateTime) : 0;
        this._lastUpdateTime = time;

        // Transition
        if (this._isTransitioning) {
            let t = Maths.inverseLerp(this._transitionTimeStart, this._transitionTimeEnd, time);
            if (t >= 1) {
                t = 1;
                this._isTransitioning = false;
                if (this._transitionEndCallback) this._transitionEndCallback();
            }
            this.timeScale = Maths.lerp(this._transitionValueStart, this._transitionValueEnd, t);
        }

        this._updateCallback(deltatime * this.timeScale);
    }

    _onRender() {
        this._renderCallback();
        this._renderFrameID = requestAnimationFrame(() => { this._onRender(); });
    }
}