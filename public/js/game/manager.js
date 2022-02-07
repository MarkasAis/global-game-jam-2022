import Maths from "../math/maths.js";
import Utils from "../other/utils.js";
import Game from "./game.js";
import ScoreManager from "./score.js";

export class Stat {
    constructor(name, positive, startingValue, color) {
        this._name = name;
        this._positive = positive;
        this._startingValue = startingValue;
        this._value = startingValue;
        this._color = color;
    }

    get positive() { return this._positive; }
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
        return `${value < 0 ? '' : '+'}${value} ${this._name}`;
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
    static _statNamesContainerElements = null;
    static _statPointsContainerElements = null;

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
    static _blankElement = null;
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
        let positiveContainer = document.getElementById('stats-container-positive');
        let negativeContainer = document.getElementById('stats-container-negative');

        GameManager._statNamesContainerElements = {
            positive: positiveContainer.getElementsByClassName('stat-names-container')[0],
            negative: negativeContainer.getElementsByClassName('stat-names-container')[0]
        };
        
        GameManager._statPointsContainerElements = {
            positive: positiveContainer.getElementsByClassName('stat-points-container')[0],
            negative: negativeContainer.getElementsByClassName('stat-points-container')[0]
        };

        // Bars
        GameManager._barsContainerElement = document.getElementById('bars-container');

        // End Screen
        GameManager._endScreenContainerElement = document.getElementById('end-screen-container');
        GameManager._endScreenScoreElement = document.getElementById('end-screen-score');
        let playAgain = document.getElementById('play-again');
        playAgain.onclick = () => {
            GameManager._closeEndScreen();
            Game.restart();
        }

        let mainMenu = document.getElementById('main-menu');
        mainMenu.onclick = () => {
            GameManager._closeEndScreen();
            window.location.replace('../');
        }

        // Score
        GameManager._scoreElement = document.getElementById('score');
        GameManager._highscoreElement = document.getElementById('highscore');

        // Other
        GameManager._overlayElement = document.getElementById('overlay');
        GameManager._blankElement = document.getElementById('blank');
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
        
        let pointsElement = document.createElement('div');
        this._statPointsElements[name] = pointsElement;

        if (stat.positive) {
            GameManager._statNamesContainerElements.positive.appendChild(nameElement);
            GameManager._statPointsContainerElements.positive.appendChild(pointsElement);
        } else {
            GameManager._statNamesContainerElements.negative.appendChild(nameElement);
            GameManager._statPointsContainerElements.negative.appendChild(pointsElement);
        }

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

    static _generateRandomExchage() {
        const MAX_DECREASE = 2;
        const MAX_INCREASE = 2;

        const EXCHANGE_PERCENT = 0.3;

        let pair = Utils.randomSample(Object.entries(GameManager._stats), 2);

        for (let i = 0; i < 2; i++)
            if (pair[0][1].positive || pair[1][1].positive)
                pair = Utils.randomSample(Object.entries(GameManager._stats), 2);

        let names = [ pair[0][0], pair[1][0] ];
        let stats = [ pair[0][1], pair[1][1] ];
        let changes = [0, 0];

        // p+ p-
        if (stats[0].positive && stats[1].positive) {
            let maxDecrease = stats[1].value-1;
            let decrease = Math.round(EXCHANGE_PERCENT * maxDecrease);
            decrease = Math.min(Math.max(1, decrease), maxDecrease);

            let increase = decrease + Maths.randomInt(-1, 1);
            if (stats[0] + increase < 1) increase++;

            changes[0] = increase;
            changes[1] = -decrease;
        }
        
        // p+ n+
        else if (stats[0].positive && !stats[1].positive) {
            changes[0] = MAX_INCREASE;
            changes[1] = MAX_INCREASE;
        }

        // n- p-
        // else if (!stats[0].positive && stats[1].positive) {
        //     let maxDecrease = Math.min(stats[0].value, stats[1].value)-1;
        //     let decreasePositive =  Math.round(EXCHANGE_PERCENT * maxDecrease);

        //     let decreaseNegative = decreasePositive + Maths.randomInt(-1, 1);
        //     if (stats[0] - decreaseNegative < 1) decreaseNegative--;

        //     changes[0] = -decreaseNegative;
        //     changes[1] = -decreasePositive;
        // }

        // n- n+
        else {
            let maxDecrease = stats[0].value-1;
            let decrease = Math.round(EXCHANGE_PERCENT * maxDecrease);

            let increase = decrease + Maths.randomInt(-1, 1);
            if (stats[1] + increase < 1) increase++;

            changes[0] = -decrease;
            changes[1] = increase;
        }


        let exchange = {};
        exchange[names[0]] = changes[0];
        exchange[names[1]] = changes[1];

        return exchange;
    }

    static _generateGoodExchanges() {
        while (true) {
            let exchange1 = GameManager._generateRandomExchage();
            let exchange2 = GameManager._generateRandomExchage();

            // No 0 value changes
            let changes1 = Object.values(exchange1);
            let changes2 = Object.values(exchange2);
            
            if (changes1[0] == 0 || changes1[1] == 0) continue;
            if (changes2[0] == 0 || changes2[1] == 0) continue;

            // No same stat exchanges
            let stats1 = Object.keys(exchange1);
            let stats2 = Object.keys(exchange2);

            if (stats1[0] == stats2[0] && stats1[1] == stats2[1]) continue;

            return [ exchange1, exchange2 ];
        }
    }

    static _choseUpgradeOptions(expectedIncrease) {
        return GameManager._generateGoodExchanges();
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
                GameManager._closeSelection();

                for (let [name, value] of stats)
                    GameManager._changeStat(name, value);
            };

            for (let j = 0; j < 2; j++) {
                let stat = GameManager._stats[stats[j][0]];
                GameManager._selectionOptionMessageElements[i][j].innerHTML = stat.changeMessage(stats[j][1]);
            }
        }
    }

    static _openSelection(options) {
        if (GameManager._selectionOpen || GameManager._endScreenOpen) return;
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

        GameManager._closeSelection();

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

    static hideBlank() {
        GameManager._blankElement.classList.add('invisible');
    }
}