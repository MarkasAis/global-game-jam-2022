export default class Timer {
    constructor(updatesPerSecond, updateCallback, renderCallback, timeScale=1) {
        this._updatesPerSecond = updatesPerSecond;
        this._updateCallback = updateCallback;
        this._renderCallback = renderCallback;

        this.timeScale = timeScale;

        this._lastUpdateTime = null;
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

    _onUpdate() {
        let time = Date.now() / 1000;
        let deltatime = this._lastUpdateTime != null ? (time - this._lastUpdateTime) : 0;
        this._lastUpdateTime = time;

        this._updateCallback(deltatime * this.timeScale);
    }

    _onRender() {
        this._renderCallback();
        this._renderFrameID = requestAnimationFrame(() => { this._onRender(); });
    }
}