import { Vec2 } from "../math/vec.js";
import Utils from "./utils.js";
import Maths from "../math/maths.js";

export default class Input {
    static _keyStates = {};
    static _mouseClientPos = Vec2(0, 0);

    static init() {
        // Setup keyboard
        document.addEventListener('keydown', e => {
            Input._keyStates[e.key] = true;
        });

        document.addEventListener('keyup', e => {
            Input._keyStates[e.key] = false;
        });

        // Setup mouse
        document.addEventListener('mousemove', e => {
            Input._mouseClientPos = Vec2(e.clientX, e.clientY);
        });
    }

    static getKeyDown(key) {
        return Input._keyStates[key] ? Input._keyStates[key] : false;
    }

    static getMousePos(canvas) {
        return Utils.mousePosOnCanvas(canvas, Input._mouseClientPos);
    }

    static getMousePosNormalized(canvas) {
        let pos = Utils.mousePosOnCanvas(canvas, Input._mouseClientPos);
        return Vec2(
            Maths.map(0, canvas.width, -1, 1, pos[0]),
            Maths.map(0, canvas.height, 1, -1, pos[1])
        );
    }
}