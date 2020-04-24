'use strict';

import { detectDirectionCollision, detectBoundaryCollision } from '../utils/index.js';

export default class FireBall {
    #WEST = 'WEST';
    #NORTH = 'NORTH';
    #EAST = 'EAST';
    #SOUTH = 'SOUTH';

    #game;
    #image;
    #width = 100;
    #height = 100;
    #position;
    #direction;
    #speed;
    #exploded = false;
    #power;

    constructor(game, x, y, direction, speed, power) {
        this.#game = game;
        this.#position = { x, y };
        this.#direction = direction;
        this.#image = this.createImage();
        this.#speed = speed;
        this.#power = power;
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

    get image() {
        return this.#image;
    }

    get exploded() {
        return this.#exploded;
    }

    get bottomSide() {
        return (this.#position.y + this.#height) - 20;
    }

    get topSide() {
        return this.#position.y + 20;
    }

    get leftSide() {
        return this.#position.x + 20;
    }

    get rightSide() {
        return (this.#position.x + this.#width) - 20;
    }

    move() {
        if (this.#exploded) return;

        let nextX = this.#position.x; 
        let nextY = this.#position.y;

        switch (this.#direction) {
            case this.#WEST: nextX = this.#position.x - this.#speed; break;
            case this.#NORTH: nextY = this.#position.y - this.#speed; break;
            case this.#EAST: nextX = this.#position.x + this.#speed; break;
            case this.#SOUTH: nextY = this.#position.y + this.#speed; break;
        }

        if (detectBoundaryCollision(nextX, nextY, this.#width, this.#height, this.#game.boundaries)) {
            this.#exploded = true;
            return;
        }

        let collisionWithWarrior = detectDirectionCollision(this, this.#game.warrior, this.#direction);
        if (collisionWithWarrior) {
            console.log('Fireball hit warrior => ', collisionWithWarrior);
            this.#game.warrior.damage(this.#power, this.#direction);
            this.#exploded = true;
            return;
        }

        this.#position.x = nextX;
        this.#position.y = nextY;
    }

    createImage() {
        let imagePath = '';

        switch (this.#direction) {
            case this.#WEST: imagePath = '/assets/images/fire_ball_left.gif'; break;
            case this.#NORTH: imagePath = '/assets/images/fire_ball_up.gif'; break;
            case this.#EAST: imagePath = '/assets/images/fire_ball_right.gif'; break;
            case this.#SOUTH: imagePath = '/assets/images/fire_ball_down.gif'; break;
        }

        let image = new Image();
        image.src = imagePath;

        return image;
    }

    draw() {
        if (!this.#image.complete) return;
        if (this.#exploded) return;

        this.#game.context.drawImage(this.#image, this.#position.x, this.#position.y, this.#width, this.#height);
    }

    update(deltaTime) {
        this.move();
    }
}