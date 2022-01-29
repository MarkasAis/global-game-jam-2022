export class Stat {
    constructor(name, startingValue, color) {
        this._name = name;
        this.value = startingValue;
        this._color = color;
    }

    get name() { return this._name; }
    get color() { return this._color; }

    changeMessage(value) {
        return value + ' ' + this._name;
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

        let pointsElement = this._statPointsElements[name];
        while (pointsElement.children.length > stat.value) 
            pointsElement.removeChild(pointsElement.lastChild);

        while (pointsElement.children.length < stat.value) {
            let point = document.createElement('div');
            point.style.backgroundColor = stat.color;
            pointsElement.appendChild(point);
        }
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