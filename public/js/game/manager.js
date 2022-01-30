import Maths from "../math/maths.js";
import Utils from "../other/utils.js";
import Game from "./game.js";
import ScoreManager from "./score.js";

export class Stat {
    constructor(name, startingValue, color) {
        this._name = name;
        this._startingValue = startingValue;
        this._value = startingValue;
        this._color = color;
    }

    get value() { return this._value; }
    set value(v) {
        this._value = Math.max(v, 0);
    }

    get name() { return this._name; }
    get color() { return this._color; }

    reset() {
        this._value = this._startingValue;
    }

    changeMessage(value) {
        return value + ' ' + this._name;
    }
}

export class Bar {
    constructor(name, startingMaxValue, startingValue, backgroundColor, foregroundColor, changeCallback) {
        this._name = name;
        this._startingMaxValue = startingMaxValue;
        this._startingValue = startingValue;

        this._maxValue = startingMaxValue;
        this._value = startingValue;

        this._backgroundColor = backgroundColor;
        this._foregroundColor = foregroundColor;
        this._changeCallback = changeCallback;
    }

    get backgroundColor() { return this._backgroundColor; }
    get foregroundColor() { return this._foregroundColor; }

    get value() { return this._value; }
    setValue(v, callback=true) { 
        this._value = v;
        if (callback && this._changeCallback) this._changeCallback();
    }

    get maxValue() { return this._maxValue; }
    set maxValue(v) { this._maxValue = v; }

    get percent() {
        return this._maxValue != 0 ? this._value / this._maxValue : 0;
    }

    get text() {
        return `${this._name} ${this._value}/${this._maxValue}`;
    }

    reset() {
        this._maxValue = this._startingMaxValue;
        this._value = this._startingValue;
    }
}

export default class GameManager {
    // Upgrade Selection
    static _selectionContainerElement = null;
    static _selectionOptionElements = null;
    static _selectionOptionMessageElements = null;
    static _selectionOpen = false;

    // Stats
    static _statNamesContainerElement = null;
    static _statPointsContainer = null;

    static _stats = {};
    static _statPointsElements = {};

    // Bars
    static _barsContainerElement = null;

    static _bars = {};
    static _barElements = {};

    // End Screen
    static _endScreenContainerElement = null;
    static _endScreenScoreElement = null;
    static _endScreenOpen = false;

    // Score
    static _scoreElement = null;
    static _highscoreElement = null;

    // Other
    static _overlayElement = null;
    static _closeCallback = null;

    static init() {
        // Selector
        GameManager._selectionContainerElement = document.getElementById('selection-container');

        let optionsContainer = document.getElementById('selection-options-container');
        GameManager._selectionOptionElements = optionsContainer.getElementsByClassName('option');

        GameManager._selectionOptionMessageElements = [];
        for (let option of GameManager._selectionOptionElements) {
            GameManager._selectionOptionMessageElements.push(
                [
                    option.getElementsByClassName('positive')[0],
                    option.getElementsByClassName('negative')[0]
                ]
            );
        }

        // Stats
        GameManager._statNamesContainerElement = document.getElementById('stat-names-container');
        GameManager._statPointsContainer = document.getElementById('stat-points-container');

        // Bars
        GameManager._barsContainerElement = document.getElementById('bars-container');

        // End Screen
        GameManager._endScreenContainerElement = document.getElementById('end-screen-container');
        GameManager._endScreenScoreElement = document.getElementById('end-screen-score');
        let playAgain = document.getElementById('play-again');
        playAgain.onclick = () => {
            GameManager._closeEndScreen();
            console.log('play again');
            Game.restart();
        }

        let mainMenu = document.getElementById('main-menu');
        mainMenu.onclick = () => {
            GameManager._closeEndScreen();
            console.log('main menu');
        }

        // Score
        GameManager._scoreElement = document.getElementById('score');
        GameManager._highscoreElement = document.getElementById('highscore');

        // Other
        GameManager._overlayElement = document.getElementById('overlay');
    }

    static reset() {
        for (let [ name, stat ] of Object.entries(this._stats)) {
            stat.reset();
            GameManager._changeStat(name);
        }

        for (let [ name, bar ] of Object.entries(this._bars)) {
            bar.reset();
            GameManager.setBar(name);
        }

        GameManager._scoreElement.innerHTML = '';
        GameManager.updateHighscore(ScoreManager.highscore);
    }

    static updateScore(score) {
        GameManager._scoreElement.innerHTML = score;
    }

    static updateHighscore(score) {
        GameManager._highscoreElement.innerHTML = `Highscore: ${score}`;
    }

    static defineStat(name, stat) {
        this._stats[name] = stat;

        let nameElement = document.createElement('div');
        nameElement.innerHTML = stat.name;
        GameManager._statNamesContainerElement.appendChild(nameElement);

        let pointsElement = document.createElement('div');
        this._statPointsElements[name] = pointsElement;
        GameManager._statPointsContainer.appendChild(pointsElement);

        GameManager._changeStat(name);
    }

    static getStat(name) {
        return this._stats[name].value;
    }

    static defineBar(name, bar) {
        this._bars[name] = bar;

        let barElement = document.createElement('div');
        barElement.style.backgroundColor = bar.backgroundColor;

        let barFill = document.createElement('div');
        barFill.classList.add('bar-fill');
        barFill.style.backgroundColor = bar.foregroundColor;
        barElement.appendChild(barFill);

        let barText = document.createElement('div');
        barText.classList.add('bar-text');
        barElement.appendChild(barText);
        
        GameManager._barsContainerElement.appendChild(barElement);

        GameManager._barElements[name] = {
            fill: barFill,
            text: barText
        };

        GameManager.setBar(name);
    }

    static upgrade(callback) {
        GameManager._closeCallback = callback;
        GameManager._openSelection(GameManager._choseUpgradeOptions());
    }

    static endScreen() {
        GameManager._openEndScreen();
    }

    static _choseUpgradeOptions(expectedIncrease) {
        const generateExchange = (positive, negative) => {
            let decrease = Math.round(negative * Maths.random(0.1, 0.5));
            let increase = decrease;

            decrease = Maths.clamp(decrease + Maths.randomInt(-1, 1), 0, negative);
            increase += Maths.randomInt(-1, 1);

            return [ increase, -decrease ];
        }

        let stats = Object.entries(GameManager._stats);
        let option1 = Utils.randomSample(stats, 2);
        let option2 = Utils.randomSample(stats, 2);

        let exchange1 = generateExchange(option1[0][1].value, option1[1][1].value);
        let exchange2 = generateExchange(option2[0][1].value, option2[1][1].value);

        let selection1 = {};
        selection1[option1[0][0]] = exchange1[0];
        selection1[option1[1][0]] = exchange1[1];

        let selection2 = {};
        selection2[option2[0][0]] = exchange2[0];
        selection2[option2[1][0]] = exchange2[1];

        return [ selection1, selection2 ];
    }

    static _changeStat(name, change=0) {
        let stat = GameManager._stats[name];
        stat.value += change;

        let pointsElement = GameManager._statPointsElements[name];
        let value = Math.max(stat.value, 0);

        while (pointsElement.children.length > value) 
            pointsElement.removeChild(pointsElement.lastChild);

        while (pointsElement.children.length < value) {
            let point = document.createElement('div');
            point.style.backgroundColor = stat.color;
            pointsElement.appendChild(point);
        }
    }

    static getBar(name) {
        return GameManager._bars[name];
    }

    static setBar(name, value, maxValue) {
        let bar = GameManager._bars[name];

        if (value != undefined) bar.setValue(value);
        if (maxValue != undefined) bar.maxValue = maxValue;

        let { fill, text } = GameManager._barElements[name];
        fill.style.width = Maths.clamp(Math.round(100 * bar.percent), 0, 100) + '%';

        text.innerHTML = bar.text;
    }

    static _populateOptions(options) {
        for (let i = 0; i < 2; i++) {
            let stats = Object.entries(options[i]);

            GameManager._selectionOptionElements[i].onclick = () => {
                for (let [name, value] of stats)
                    GameManager._changeStat(name, value);

                GameManager._closeSelection();
            };

            for (let j = 0; j < 2; j++) {
                let stat = GameManager._stats[stats[j][0]];
                GameManager._selectionOptionMessageElements[i][j].innerHTML = stat.changeMessage(stats[j][1]);
            }
        }
    }

    static _openSelection(options) {
        if (GameManager._selectionOpen) return;
        GameManager._selectionOpen = true;

        GameManager._populateOptions(options);
        GameManager._selectionContainerElement.classList.add('visible');
        GameManager._overlayElement.classList.add('visible');
    }

    static _closeSelection() {
        if (!GameManager._selectionOpen) return;
        GameManager._selectionOpen = false;

        GameManager._selectionContainerElement.classList.remove('visible');
        GameManager._overlayElement.classList.remove('visible');

        if (GameManager._closeCallback) {
            GameManager._closeCallback();
            GameManager._closeCallback = null;
        }
    }

    static _populateEndScreen() {
        if (ScoreManager.isNewHighscore) {
            GameManager._endScreenScoreElement.classList.add('highscore');
            GameManager._endScreenScoreElement.innerHTML = `New Highscore: ${ScoreManager.score}`;
        } else {
            GameManager._endScreenScoreElement.classList.remove('highscore');
            GameManager._endScreenScoreElement.innerHTML = `Score: ${ScoreManager.score}`;
        }
        
    }

    static _openEndScreen() {
        if (GameManager._endScreenOpen) return;
        GameManager._endScreenOpen = true;

        GameManager._populateEndScreen();
        GameManager._endScreenContainerElement.classList.add('visible');
        GameManager._overlayElement.classList.add('visible');
        GameManager._scoreElement.classList.remove('visible');
    }

    static _closeEndScreen() {
        if (!GameManager._endScreenOpen) return;
        GameManager._endScreenOpen = false;

        GameManager._endScreenContainerElement.classList.remove('visible');
        GameManager._overlayElement.classList.remove('visible');
        GameManager._scoreElement.classList.add('visible');
    }
}