import Maths from "../math/maths.js";

export class Stat {
    constructor(name, startingValue, color) {
        this._name = name;
        this._value = startingValue;
        this._color = color;
    }

    get value() { return this._value; }
    set value(v) {
        this._value = Math.max(v, 0);
    }

    get name() { return this._name; }
    get color() { return this._color; }

    changeMessage(value) {
        return value + ' ' + this._name;
    }
}

export class Bar {
    constructor(name, maxValue, startingValue, backgroundColor, foregroundColor, changeCallback) {
        this._name = name;
        this._maxValue = maxValue;
        this._value = startingValue;
        this._backgroundColor = backgroundColor;
        this._foregroundColor = foregroundColor;
        this._changeCallback = changeCallback;
    }

    get backgroundColor() { return this._backgroundColor; }
    get foregroundColor() { return this._foregroundColor; }

    get value() { return this._value; }
    set value(v) { 
        this._value = v;
        if (this._changeCallback) this._changeCallback();
    }

    get maxValue() { return this._maxValue; }
    set maxValue(v) { this._maxValue = v; }

    get percent() {
        return this._value / this._maxValue;
    }

    get text() {
        return `${this._name} ${this._value}/${this._maxValue}`;
    }
}

export default class StatsManager {
    static _selectionContainerElement = null;
    static _selectionOptionElements = null;
    static _selectionOptionMessageElements = null;

    static _statNamesContainerElement = null;
    static _statPointsContainer = null;

    static _stats = {};
    static _statPointsElements = {};

    static _barsContainerElement = null;

    static _bars = {};
    static _barElements = {};

    static _closeCallback = null;

    static init() {
        // Selector
        StatsManager._selectionContainerElement = document.getElementById('selection-container');

        let optionsContainer = document.getElementById('selection-options-container');
        StatsManager._selectionOptionElements = optionsContainer.getElementsByClassName('option');

        StatsManager._selectionOptionMessageElements = [];
        for (let option of StatsManager._selectionOptionElements) {
            StatsManager._selectionOptionMessageElements.push(
                [
                    option.getElementsByClassName('positive')[0],
                    option.getElementsByClassName('negative')[0]
                ]
            );
        }

        // Stats
        StatsManager._statNamesContainerElement = document.getElementById('stat-names-container');
        StatsManager._statPointsContainer = document.getElementById('stat-points-container');

        // Bars
        StatsManager._barsContainerElement = document.getElementById('bars-container');
    }

    static defineStat(name, stat) {
        this._stats[name] = stat;

        let nameElement = document.createElement('div');
        nameElement.innerHTML = stat.name;
        StatsManager._statNamesContainerElement.appendChild(nameElement);

        let pointsElement = document.createElement('div');
        this._statPointsElements[name] = pointsElement;
        StatsManager._statPointsContainer.appendChild(pointsElement);

        StatsManager._changeStat(name);
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
        
        StatsManager._barsContainerElement.appendChild(barElement);

        StatsManager._barElements[name] = {
            fill: barFill,
            text: barText
        };

        StatsManager.changeBar(name);
    }

    static upgrade(callback) {
        StatsManager._closeCallback = callback;

        StatsManager._openSelection([
            {
                'playerMoveSpeed': 5,
                'playerBulletSpeed': -3
            },
            {
                'playerBulletSpeed': 4,
                'playerMoveSpeed': -2
            }
        ]);
    }

    static _changeStat(name, change=0) {
        let stat = StatsManager._stats[name];
        stat.value += change;

        let pointsElement = StatsManager._statPointsElements[name];
        let value = Math.max(stat.value, 0);

        while (pointsElement.children.length > value) 
            pointsElement.removeChild(pointsElement.lastChild);

        while (pointsElement.children.length < value) {
            let point = document.createElement('div');
            point.style.backgroundColor = stat.color;
            pointsElement.appendChild(point);
        }
    }

    static changeBar(name, change=0) {
        let bar = StatsManager._bars[name];
        bar.value += change;

        let { fill, text } = StatsManager._barElements[name];
        fill.style.width = Maths.clamp(Math.round(100 * bar.percent), 0, 100) + '%';

        text.innerHTML = bar.text;
    }

    static _populateOptions(options) {
        for (let i = 0; i < 2; i++) {
            let stats = Object.entries(options[i]);

            StatsManager._selectionOptionElements[i].onclick = () => {
                for (let [name, value] of stats)
                    StatsManager._changeStat(name, value);

                StatsManager._closeSelection();
            };

            for (let j = 0; j < 2; j++) {
                let stat = StatsManager._stats[stats[j][0]];
                StatsManager._selectionOptionMessageElements[i][j].innerHTML = stat.changeMessage(stats[j][1]);
            }
        }
    }

    static _openSelection(options) {
        StatsManager._populateOptions(options);
        StatsManager._selectionContainerElement.classList.add('visible');
    }

    static _closeSelection() {
        StatsManager._selectionContainerElement.classList.remove('visible');
        if (StatsManager._closeCallback) {
            StatsManager._closeCallback();
            StatsManager._closeCallback = null;
        }
    }
}