'use strict';

import Warrior from './objects/warrior.js';
import Monster from './objects/monster.js';
import Cave from './objects/cave.js';
import Screen from './screen.js';

export default class Game {
    #WEST = 'WEST';
    #NORTH = 'NORTH';
    #EAST = 'EAST';
    #SOUTH = 'SOUTH';

    #gameCanvas;
    #gameContext;
    #gameBoundaries;
    #warrior;
    #monster;
    #cave;
    #gameState;

    #GAMESTATE = {
        PAUSED: 0,
        RUNNING: 1,
        MENU: 2,
        GAMEOVER: 3,
        KO: 4
    };

    #gameScreen;
    #toggleMenu = false;
    #registeredEvents = false;

    constructor(gameCanvas) {
        this.#gameCanvas = gameCanvas;
        this.#gameContext = gameCanvas.getContext('2d');
        this.#gameContext.globalCompositeOperation = 'destination-over';
        this.#gameState = this.#GAMESTATE.MENU;
        this.#toggleMenu = true;
        this.#gameScreen = new Screen(this);
    }

    get width() {
        return this.#gameCanvas.width;
    }

    get height() {
        return this.#gameCanvas.height;
    }

    get context() {
        return this.#gameContext;
    }

    get cave() {
        return this.#cave;
    }

    set cave(cave) {
        if (!(cave instanceof Cave)) throw new TypeError('Expected valid cave object');

        this.#cave = cave;
        this.#gameBoundaries = this.calculateGameBoundaries();
    }

    get monster() {
        return this.#monster;
    }

    set monster(monster) {
        if (!(monster instanceof Monster)) throw new TypeError('Expected valid monster object');

        this.#monster = monster;
    }

    get warrior() {
        return this.#warrior;
    }

    set warrior(warrior) {
        if (!(warrior instanceof Warrior)) throw new TypeError('Expected valid warrior object');

        this.#warrior = warrior;
        if (!this.#registeredEvents)
            this.registerEventHandlers();
    }

    get boundaries() {
        return this.#gameBoundaries;
    }

    calculateGameBoundaries() {
        return {
            w: this.#cave.wallSize,
            n: this.#cave.wallSize,
            e: this.#gameCanvas.width - this.#cave.wallSize,
            s: this.#gameCanvas.height - this.#cave.wallSize
        };
    }

    registerEventHandlers() {
        document.addEventListener('keydown', event => {
            if (event.keyCode !== 27 && this.#gameState !== this.#GAMESTATE.RUNNING)
                return;

            if (event.keyCode === 27 && this.#gameState !== this.#GAMESTATE.RUNNING && this.#gameState !== this.#GAMESTATE.PAUSED)
                return;

            switch (event.keyCode) {
                case 37: this.#warrior.walk(this.#WEST); break;
                case 38: this.#warrior.walk(this.#NORTH); break;
                case 39: this.#warrior.walk(this.#EAST); break;
                case 40: this.#warrior.walk(this.#SOUTH); break;
                case 32: this.#warrior.attack(); break;
                case 27: this.togglePause(); break;
            }
        });

        document.addEventListener('keyup', event => {
            switch (event.keyCode) {
                case 37: this.#warrior.stop(); break;
                case 38: this.#warrior.stop(); break;
                case 39: this.#warrior.stop(); break;
                case 40: this.#warrior.stop(); break;
                case 32: this.#warrior.stop(); break;
            }
        });

        this.#registeredEvents = true;
    }

    draw() {
        if (this.#gameState === this.#GAMESTATE.MENU)
            return;

        this.context.clearRect(0, 0, this.width, this.height);
        this.#warrior.draw();
        this.#monster.draw();
        this.#cave.draw();
    }

    update(deltaTime) {
        if (this.#gameState === this.#GAMESTATE.PAUSED && this.#toggleMenu)
            this.#gameScreen.menu = 'PAUSE';

        if (this.#gameState === this.#GAMESTATE.MENU && this.#toggleMenu)
            this.#gameScreen.menu = 'MAIN';

        if (this.#gameState === this.#GAMESTATE.GAMEOVER && this.#toggleMenu)
            this.#gameScreen.menu = 'GAMEOVER';

        if (this.#gameState === this.#GAMESTATE.KO && this.#toggleMenu)
            this.#gameScreen.menu = 'KO';


        if (this.#gameState === this.#GAMESTATE.RUNNING && this.#toggleMenu)
            this.#gameScreen.menu = null;

        if (this.#toggleMenu)
            this.#toggleMenu = false;

        if (this.#gameState !== this.#GAMESTATE.RUNNING) return;

        this.#warrior.update(deltaTime);
        this.#monster.update(deltaTime);
        this.#cave.update(deltaTime);
    }

    togglePause() {
        if (this.#gameState === this.#GAMESTATE.PAUSED) {
            this.#gameState = this.#GAMESTATE.RUNNING;
        } else {
            this.#gameState = this.#GAMESTATE.PAUSED;
        }
        this.#toggleMenu = true;
    }

    startNewGame(linkHealth, linkStrength, enemyHealth, enemyStrength) {
        this.context.clearRect(0, 0, this.width, this.height);
        this.cave = new Cave(this);
        this.warrior = new Warrior(this, Number.parseInt(linkHealth), Number.parseInt(linkStrength));
        this.monster = new Monster(this, Number.parseInt(enemyHealth), Number.parseInt(enemyStrength));
        this.#gameState = this.#GAMESTATE.RUNNING;
        this.#toggleMenu = true;
    }

    updateHealthBar(character) {
        if (character === this.#warrior) {
            this.#gameScreen.updateHealthBar('Warrior', this.#warrior.health, this.#warrior.currentHealth);
            if (this.#warrior.currentHealth <= 0) {
                this.#warrior.die();
                this.#monster.win();
                this.#gameState = this.#GAMESTATE.GAMEOVER;
                this.#toggleMenu = true;
            }
        }

        if (character === this.#monster) {
            this.#gameScreen.updateHealthBar('Monster', this.#monster.health, this.#monster.currentHealth);
            if (this.#monster.currentHealth <= 0) {
                this.#monster.die();
                this.#warrior.win();
                this.#gameState = this.#GAMESTATE.KO;
                this.#toggleMenu = true;
            }
        }
    }
}