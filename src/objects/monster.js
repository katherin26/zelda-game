'use strict';

import { detectBoundaryCollision, detectDirectionCollision } from '../utils/index.js';
import FireBall from './fireball.js';

export default class Monster {
    #WEST = 'WEST';
    #NORTH = 'NORTH';
    #EAST = 'EAST';
    #SOUTH = 'SOUTH';
    #IMAGE_PATH = '/assets/images/monster.png';

    #game;
    #direction;
    #flyingDirection;
    #imageFrames;
    #currentFrame;
    #width = 105;
    #height = 135;
    #speed = 20;
    #position = { x: 0, y: 0 };
    #health;
    #currentHealth;
    #strength;
    #flyAnimationDeltaTime = 0;
    #attackDeltaTime = 0;
    #moveAnimationDeltaTime = 0;
    #fireBalls = [];
    #fireBallSpeed = 7;
    #changeDirection = false;
    #victory = false;
    #alive = true;

    #movementFrames = {
        right: [
            { x: 8, y: 146, w: 40, h: 50 },
            { x: 70, y: 146, w: 35, h: 50 },
            { x: 145, y: 144, w: 25, h: 50 }
        ],
        left: [
            { x: 23, y: 82, w: 40, h: 50 },
            { x: 85, y: 82, w: 35, h: 50 },
            { x: 151, y: 80, w: 25, h: 50 }
        ],
        down: [
            { x: 5, y: 15, w: 55, h: 50 },
            { x: 70, y: 15, w: 55, h: 50 },
            { x: 140, y: 15, w: 45, h: 50 }
        ],
        up: [
            { x: 5, y: 210, w: 55, h: 50 },
            { x: 70, y: 210, w: 55, h: 50 },
            { x: 135, y: 208, w: 50, h: 50 }
        ]
    };

    #nextMovementFrameIndex = 0;

    constructor(game, health, strength) {
        this.#game = game;
        this.#health = health;
        this.#currentHealth = health;
        this.#strength = strength;
        this.#direction = this.#WEST;
        this.#flyingDirection = this.#NORTH;
        this.#imageFrames = new Image();
        this.#imageFrames.src = this.#IMAGE_PATH;
        this.#position.x = this.#game.boundaries.e - this.#width - 20;
        this.#position.y = this.#game.height / 2 - this.#height;
    }

    get position() {
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
        return (this.#position.y + this.#height) - 30;
    }

    get topSide() {
        return this.#position.y + 5;
    }

    get leftSide() {
        return this.#position.x;
    }

    get rightSide() {
        return (this.#position.x + this.#width) - 30;
    }

    get health() {
        return this.#health;
    }

    get currentHealth() {
        return this.#currentHealth;
    }

    fly() {
        if (!this.#alive) return;
        if (this.#nextMovementFrameIndex >= 2) this.#nextMovementFrameIndex = 0;

        switch (this.#direction) {
            case this.#WEST: this.#currentFrame = this.#movementFrames.left[this.#nextMovementFrameIndex]; break;
            case this.#NORTH: this.#currentFrame = this.#movementFrames.up[this.#nextMovementFrameIndex]; break;
            case this.#EAST: this.#currentFrame = this.#movementFrames.right[this.#nextMovementFrameIndex]; break;
            case this.#SOUTH: this.#currentFrame = this.#movementFrames.down[this.#nextMovementFrameIndex]; break;
        }

        this.#nextMovementFrameIndex++;
    }

    move() {
        if (!this.#alive) return;
        if (this.#victory) return;

        const flyingDirectionCollision = detectDirectionCollision(this, this.#game.warrior, this.#flyingDirection);

        if (flyingDirectionCollision) {
            this.#changeDirection = true;
            this.#game.warrior.damage(this.#strength, this.#flyingDirection);

            switch (this.#flyingDirection) {
                case this.#NORTH: this.#flyingDirection = this.#SOUTH; break;
                case this.#SOUTH: this.#flyingDirection = this.#NORTH; break;
                case this.#WEST: this.#flyingDirection = this.#EAST; break;
                case this.#EAST: this.#flyingDirection = this.#WEST; break;
            }
        }

        const facingDirectionCollision = detectDirectionCollision(this, this.#game.warrior, this.#direction);

        if (facingDirectionCollision)
            this.#game.warrior.damage(this.#strength, this.#direction);

        let nextX = this.#position.x;
        let nextY = this.#position.y;

        if (this.#flyingDirection === this.#NORTH)
            nextY = this.#position.y - this.#speed;

        if (this.#flyingDirection === this.#SOUTH)
            nextY = this.#position.y + this.#speed;

        if (this.#flyingDirection === this.#WEST)
            nextX = this.#position.x - this.#speed;

        if (this.#flyingDirection === this.#EAST)
            nextX = this.#position.x + this.#speed;

        let boundaryCollision = detectBoundaryCollision(nextX, nextY, this.#width, this.#height, this.#game.boundaries);

        if (boundaryCollision === 'TOP_COLLISION') {
            if (this.#changeDirection) {
                if (this.#direction === this.#WEST) {
                    this.#direction = this.#SOUTH;
                    this.#flyingDirection = this.#WEST;
                    nextX = this.#game.boundaries.e - this.#width - 20;
                    nextY = this.#game.boundaries.n + 20;
                } else if (this.#direction === this.#EAST) {
                    nextX = this.#game.boundaries.w + 20;
                    nextY = this.#game.boundaries.n + 20;
                    this.#direction = this.#SOUTH;
                    this.#flyingDirection = this.#EAST;
                }
                this.#changeDirection = false;
            } else {
                this.#flyingDirection = this.#SOUTH;
            }
        }

        if (boundaryCollision === 'BOTTOM_COLLISION') {
            if (this.#changeDirection) {
                if (this.#direction === this.#WEST) {
                    this.#direction = this.#NORTH;
                    this.#flyingDirection = this.#WEST;
                    nextX = this.#game.boundaries.e - this.#width - 20;
                    nextY = this.#game.boundaries.s - this.#height - 20;
                } else if (this.#direction === this.#EAST) {
                    this.#direction = this.#NORTH;
                    this.#flyingDirection = this.#EAST;
                    nextX = this.#game.boundaries.w + 20;
                    nextY = this.#game.boundaries.s - this.#height - 20;
                }
                this.#changeDirection = false;
            } else {
                this.#flyingDirection = this.#NORTH;
            }
        }

        if (boundaryCollision === 'LEFT_COLLISION') {
            if (this.#changeDirection) {
                if (this.#direction === this.#NORTH) {
                    this.#direction = this.#EAST;
                    this.#flyingDirection = this.#NORTH;
                    nextX = this.#game.boundaries.w + 20;
                    nextY = this.#game.boundaries.s - this.#height - 20;
                } else if (this.#direction === this.#SOUTH) {
                    this.#direction = this.#EAST;
                    this.#flyingDirection = this.#SOUTH;
                    nextX = this.#game.boundaries.w + 20;
                    nextY = this.#game.boundaries.n + 20;
                }
                this.#changeDirection = false;
            } else {
                this.#flyingDirection = this.#EAST;
            }
        }

        if (boundaryCollision === 'RIGHT_COLLISION') {

            if (this.#changeDirection) {
                if (this.#direction === this.#NORTH) {
                    this.#direction = this.#WEST;
                    this.#flyingDirection = this.#NORTH;
                    nextX = this.#game.boundaries.e - this.#width - 20;
                    nextY = this.#game.boundaries.s - this.#height - 20;
                } else if (this.#direction === this.#SOUTH) {
                    this.#direction = this.#WEST;
                    this.#flyingDirection = this.#SOUTH;
                    nextX = this.#game.boundaries.e - this.#width - 20;
                    nextY = this.#game.boundaries.n + 20;
                }
                this.#changeDirection = false;
            } else {
                this.#flyingDirection = this.#WEST;
            }
        }

        this.#position.x = nextX;
        this.#position.y = nextY;
    }

    damage(points) {
        this.#currentHealth -= points;
        this.#changeDirection = true;
        this.#game.updateHealthBar(this);

        switch (this.#flyingDirection) {
            case this.#NORTH: this.#flyingDirection = this.#SOUTH; break;
            case this.#SOUTH: this.#flyingDirection = this.#NORTH; break;
            case this.#WEST: this.#flyingDirection = this.#EAST; break;
            case this.#EAST: this.#flyingDirection = this.#WEST; break;
        }
    }

    attack() {
        if (!this.#alive) return;
        if (this.#victory) return;
        let fireBall;
        let fireBallSpeed = this.#fireBallSpeed;
        let fireBallPower = this.#strength;

        switch (this.#direction) {
            case this.#WEST:
                fireBall = new FireBall(
                    this.#game,
                    this.position.x - 80,
                    this.position.y + ((this.#height - 100) / 2),
                    this.#direction,
                    fireBallSpeed,
                    fireBallPower);
                break;
            case this.#NORTH:
                fireBall = new FireBall(
                    this.#game,
                    this.position.x + (this.#width / 2),
                    this.position.y - 10,
                    this.#direction,
                    fireBallSpeed,
                    fireBallPower);
                break;
            case this.#EAST:
                fireBall = new FireBall(
                    this.#game,
                    this.position.x + this.#width + 10,
                    this.position.y + (this.#height / 2),
                    this.#direction,
                    fireBallSpeed,
                    fireBallPower);
                break;
            case this.#SOUTH:
                fireBall = new FireBall(
                    this.#game,
                    this.position.x + (this.#height / 2),
                    this.position.y + +this.#height + 10,
                    this.#direction,
                    fireBallSpeed,
                    fireBallPower);
                break;
        }

        this.#fireBalls.push(fireBall);
    }

    win() {
        this.#victory = true;
    }

    die() {
        this.#alive = false;
    }


    draw() {
        if (!this.#imageFrames.complete) return;
        if (!this.#currentFrame) return;

        this.#width = this.#currentFrame.w * 3;
        this.#height = this.#currentFrame.h * 3;

        const [image, clipX, clipY, clipW, clipH, x, y, w, h] = [
            this.#imageFrames,
            this.#currentFrame.x,
            this.#currentFrame.y,
            this.#currentFrame.w,
            this.#currentFrame.h,
            this.#position.x,
            this.#position.y,
            this.#width,
            this.#height
        ];

        this.#game.context.drawImage(image, clipX, clipY, clipW, clipH, x, y, w, h);

        for (let fireBall of this.#fireBalls)
            fireBall.draw();
    }

    update(deltaTime) {
        this.#flyAnimationDeltaTime += deltaTime;
        this.#attackDeltaTime += deltaTime;
        this.#moveAnimationDeltaTime += deltaTime;

        this.#fireBalls = this.#fireBalls.filter(fb => !fb.exploded);

        for (let fireBall of this.#fireBalls)
            fireBall.update(deltaTime);

        if (this.#attackDeltaTime >= 1000) {
            this.attack();
            this.#attackDeltaTime = 0;
        }

        if (this.#flyAnimationDeltaTime >= 100) {
            this.fly();
            this.#flyAnimationDeltaTime = 0;
        }

        if (this.#moveAnimationDeltaTime >= 50) {
            this.move();
            this.#moveAnimationDeltaTime = 0;
        }
    }
}