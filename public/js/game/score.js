import GameManager from "./manager.js";

export default class ScoreManager {
    static _score = 0;
    static _highscore = 0;
    static _newHighscore = false;

    static get score() { return this._score; }
    static get highscore() { return this._highscore; }
    static get isNewHighscore() { return this._newHighscore; }

    static init() {
        this._highscore = localStorage.getItem('highscore') || 0;
    }

    static reset() {
        this._score = 0;
        this._newHighscore = false;
    }

    static increaseScore(points) {
        this._score += points;

        if (this._score > this._highscore) {
            this._highscore = this._score;
            this._newHighscore = true;
            localStorage.setItem('highscore', this._highscore);
            GameManager.updateHighscore(this._highscore);
        }

        GameManager.updateScore(this._score);
    }
}