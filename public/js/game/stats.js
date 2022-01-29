export class Stat {
    constructor(name, startingValue) {
        this._name = name;
        this.value = startingValue;
    }

    changeMessage(value) {
        return value + ' ' + this._name;
    }
}

export default class StatsManager {
    static _selectionContainerElement = null;
    static _selectionOptionElements = null;
    static _selectionOptionMessageElements = null;

    static _stats = {};

    static init() {
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

        StatsManager.defineStat('playerMoveSpeed', new Stat('Player Move Speed', 5));
        StatsManager.defineStat('playerBulletSpeed', new Stat('Player Bullet Speed', 5));
    }

    static defineStat(name, stat) {
        this._stats[name] = stat;
    }

    static upgrade() {
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

    static _changeStat(name, value) {
        StatsManager._stats[name].value += value;
        console.log(StatsManager._stats[name]);
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
    }
}