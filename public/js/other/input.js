export default class Input {
    static _keyStates = {};

    static init() {
        document.addEventListener('keydown', (e) => {
            Input._keyStates[e.key] = true;
        });

        document.addEventListener('keyup', (e) => {
            Input._keyStates[e.key] = false;
        });
    }

    static getKeyDown(key) {
        return Input._keyStates[key] ? Input._keyStates[key] : false;
    }
}