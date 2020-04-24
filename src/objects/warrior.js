'use strict';

import { detectDirectionCollision, calculateNewCordinates } from '../utils/index.js';

export default class Warrior {
    #WEST = 'WEST';
    #NORTH = 'NORTH';
    #EAST = 'EAST';
    #SOUTH = 'SOUTH';
    #IMAGE_PATH = '/assets/images/link.png';

    #game;
    #direction;
    #imageFrames;
    #currentFrame;
    #width = 50;
    #height = 50;
    #speed = 20;
    #position = { x: 0, y: 0 };
    #health;
    #currentHealth;
    #strength;
    #alive = true;

    #stationaryFrames = {
        right: { x: 330, y: 120 },
        left: { x: 330, y: 30 },
        down: { x: 90, y: 30 },
        up: { x: 90, y: 120 }
    };

    #walkMovementCount = 5;
    #walkMovementFrames = {
        right: [
            { x: 390, y: 120 },
            { x: 360, y: 120 },
            { x: 300, y: 120 },
            { x: 270, y: 120 },
            { x: 240, y: 120 }
        ],
        left: [
            { x: 390, y: 30 },
            { x: 360, y: 30 },
            { x: 300, y: 30 },
            { x: 270, y: 30 },
            { x: 240, y: 30 }
        ],
        down: [
            { x: 150, y: 30 },
            { x: 120, y: 30 },
            { x: 60, y: 30 },
            { x: 30, y: 30 },
            { x: 0, y: 30 }
        ],
        up: [
            { x: 150, y: 120 },
            { x: 120, y: 120 },
            { x: 60, y: 120 },
            { x: 30, y: 120 },
            { x: 0, y: 120 }
        ]
    };

    #attackwalkMovementFrames = {
        right: [
            { x: 240, y: 180, w: 25, h: 25 },
            { x: 268, y: 180, w: 25, h: 25 },
            { x: 295, y: 180, w: 30, h: 30 },
            { x: 327, y: 180, w: 30, h: 30 },
            { x: 358, y: 175, w: 30, h: 30 }
        ],
        left: [
            { x: 240, y: 90, w: 25, h: 25 },
            { x: 268, y: 90, w: 25, h: 25 },
            { x: 295, y: 90, w: 30, h: 30 },
            { x: 327, y: 90, w: 30, h: 30 },
            { x: 358, y: 85, w: 30, h: 30 }
        ],
        down: [
            { x: 0, y: 90, w: 25, h: 25 },
            { x: 28, y: 90, w: 25, h: 25 },
            { x: 55, y: 85, w: 30, h: 30 },
            { x: 84, y: 85, w: 30, h: 35 },
            { x: 115, y: 85, w: 29, h: 35 }
        ],
        up: [
            { x: 0, y: 175, w: 25, h: 35 },
            { x: 28, y: 175, w: 25, h: 35 },
            { x: 28, y: 175, w: 25, h: 35 },
            { x: 28, y: 175, w: 25, h: 35 },
            { x: 28, y: 175, w: 25, h: 35 }
        ]
    };

    #deadFrame = { x: 88, y: 212, w: 25, h: 25 };
    #victoryFrame = { x: 265, y: 212, w: 25, h: 25 };
    #victory = false;

    #nextMovementFrameIndex = 0;
    #nextAttackFrameIndex = 0;
    #attackMode = false;

    constructor(game, health, strength) {
        this.#game = game;
        this.#health = health;
        this.#currentHealth = health;
        this.#strength = strength;
        this.#direction = this.#EAST;
        this.#imageFrames = new Image();
        this.#imageFrames.src = this.#IMAGE_PATH;
        this.#currentFrame = this.#stationaryFrames.right;
        this.#position.x = this.#game.boundaries.w + 5;
        this.#position.y = this.#game.height / 2 - this.#height;
    }

    get position() {
        if (this.#attackMode && this.#direction === this.#EAST)
            return { x: this.#position.x + 15, y: this.#position.y };
        if (this.#attackMode && this.#direction === this.#WEST)
            return { x: this.#position.x - 15, y: this.#position.y };
        if (this.#attackMode && this.#direction === this.#SOUTH)
            return { x: this.#position.x, y: this.#position.y + 15 };
        if (this.#attackMode && this.#direction === this.#NORTH)
            return { x: this.#position.x, y: this.#position.y - 15 };

        return this.#position;
    }

    get height() {
        return this.#height;
    }

    get width() {
        return this.#width;
    }

    get orientation() {
        return this.#direction;
    }

    get speed() {
        return this.#speed;
    }

    get bottomSide() {
        return (this.#position.y + this.#height);
    }

    get topSide() {
        return this.#position.y;
    }

    get leftSide() {
        return this.#position.x;
    }

    get rightSide() {
        return (this.#position.x + this.#width);
    }

    get health() {
        return this.#health;
    }

    get currentHealth() {
        return this.#currentHealth;
    }

    walk(direction) {
        if (this.#attackMode) return;
        if (!this.#alive) return;
        if (this.#victory) return;

        if (direction !== this.#direction || this.#nextMovementFrameIndex >= this.#walkMovementCount)
            this.#nextMovementFrameIndex = 0;

        let changeX = 0, changeY = 0;

        if (direction === this.#WEST) {
            this.#currentFrame = this.#walkMovementFrames.left[this.#nextMovementFrameIndex];
            changeX = - this.#speed;
        }

        if (direction === this.#NORTH) {
            this.#currentFrame = this.#walkMovementFrames.up[this.#nextMovementFrameIndex];
            changeY = - this.#speed;
        }

        if (direction === this.#EAST) {
            this.#currentFrame = this.#walkMovementFrames.right[this.#nextMovementFrameIndex];
            changeX = this.#speed;
        }

        if (direction === this.#SOUTH) {
            this.#currentFrame = this.#walkMovementFrames.down[this.#nextMovementFrameIndex];
            changeY = this.#speed;
        }

        this.#nextMovementFrameIndex++;
        this.#direction = direction;
        this.move(changeX, changeY);
    }

    move(changeX, changeY) {
        if (!this.#alive) return;
        if (this.#victory) return;
        if (!changeX && !changeY) return;

        this.#position = calculateNewCordinates(this.#position, changeX, changeY, this.#width, this.#height, this.#game.boundaries);
    }

    stop() {
        if (this.#attackMode) return;
        if (!this.#alive) return;
        if (this.#victory) return;

        this.#nextMovementFrameIndex = 0;

        switch (this.#direction) {
            case this.#EAST: this.#currentFrame = this.#stationaryFrames.right; break;
            case this.#WEST: this.#currentFrame = this.#stationaryFrames.left; break;
            case this.#SOUTH: this.#currentFrame = this.#stationaryFrames.down; break;
            case this.#NORTH: this.#currentFrame = this.#stationaryFrames.up; break;
        }
    }

    attack() {
        if (!this.#alive) return;
        if (this.#attackMode) return;
        if (this.#victory) return;

        this.#attackMode = true;
    }

    damage(points, direction) {
        if (this.#attackMode) {
            if (this.#direction === this.#WEST && direction === this.#EAST) return;
            if (this.#direction === this.#EAST && direction === this.#WEST) return;
            if (this.#direction === this.#NORTH && direction === this.#SOUTH) return;
            if (this.#direction === this.#SOUTH && direction === this.#NORTH) return;
        }

        this.#currentHealth -= points;

        switch (direction) {
            case this.#EAST: this.move(+20, 0); break;
            case this.#WEST: this.move(-20, 0); break;
            case this.#SOUTH: this.move(0, +20); break;
            case this.#NORTH: this.move(0, -20); break;
        }

        this.#game.updateHealthBar(this);
        this.stop();
    }

    swingSword() {
        if (this.#direction === this.#EAST) {
            if (this.#nextAttackFrameIndex >= this.#attackwalkMovementFrames.right.length) return false;
            this.#currentFrame = this.#attackwalkMovementFrames.right[this.#nextAttackFrameIndex];
        }

        if (this.#direction === this.#WEST) {
            if (this.#nextAttackFrameIndex >= this.#attackwalkMovementFrames.left.length) return false;
            this.#currentFrame = this.#attackwalkMovementFrames.left[this.#nextAttackFrameIndex]
        }

        if (this.#direction === this.#SOUTH) {
            if (this.#nextAttackFrameIndex >= this.#attackwalkMovementFrames.down.length) return false;
            this.#currentFrame = this.#attackwalkMovementFrames.down[this.#nextAttackFrameIndex];
        }

        if (this.#direction === this.#NORTH) {
            if (this.#nextAttackFrameIndex >= this.#attackwalkMovementFrames.up.length) return false;
            this.#currentFrame = this.#attackwalkMovementFrames.up[this.#nextAttackFrameIndex];
        }

        this.#nextAttackFrameIndex++;
        return true;
    }

    win() {
        this.#victory = true;
        this.#currentFrame = this.#victoryFrame;
    }

    die() {
        this.#alive = false;
        this.#currentFrame = this.#deadFrame;
    }

    draw() {
        if (!this.#imageFrames.complete) return;

        this.#width = (this.#currentFrame.w || 20) * 3;
        this.#height = (this.#currentFrame.h || 25) * 3;

        const [image, clipX, clipY, clipW, clipH, x, y, w, h] = [
            this.#imageFrames,
            this.#currentFrame.x,
            this.#currentFrame.y,
            this.#currentFrame.w || 20,
            this.#currentFrame.h || 25,
            this.#position.x,
            this.#position.y,
            this.#width,
            this.#height
        ];

        this.#game.context.drawImage(image, clipX, clipY, clipW, clipH, x, y, w, h);
    }

    update(deltaTime) {
        if (this.#attackMode) {
            if (this.swingSword()) {
                const collisionWithMoster = detectDirectionCollision(this, this.#game.monster, this.#direction);

                if (collisionWithMoster) {
                    let changeX = 0, changeY = 0;

                    if (this.#direction === this.#EAST)
                        changeX = - this.#speed * 3;

                    if (this.#direction === this.#SOUTH)
                        changeY = - this.#speed * 3;

                    if (this.#direction === this.#WEST)
                        changeX = this.#speed * 3;

                    if (this.#direction === this.#NORTH)
                        changeY = this.#speed * 3;
                    
                    this.#game.monster.damage(this.#strength, this.#direction);
                    this.move(changeX, changeY);
                }

            } else {
                this.#nextAttackFrameIndex = 0;
                this.#attackMode = false;
                //this.stop();
            }
        }
    }
}