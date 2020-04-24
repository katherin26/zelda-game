'use strict';

import settings from './settings.js';
import Game from './game.js';

const gameCanvas = document.querySelector('#gameCanvas');
gameCanvas.width = settings.width;
gameCanvas.height = settings.height;

const game = new Game(gameCanvas);

let lastTimestamp = 0;
function gameLoop(timestamp) {
    let deltaTime = timestamp - lastTimestamp;
    lastTimestamp = timestamp;

    game.update(deltaTime);
    game.draw();

    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);