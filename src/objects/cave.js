"use strict";

export default class Cave {
  #IMAGE_PATH = "/assets/images/tiles-cave.png";

  #game;
  #imageFrames;
  #width;
  #height;
  #position = { x: 200, y: 200 };
  #wallWidth = 100;
  #wallHeight = 50;

  constructor(game) {
    this.#game = game;
    this.#width = game.width;
    this.#height = game.height;
    this.#imageFrames = new Image();
    this.#imageFrames.src = this.#IMAGE_PATH;
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

  get wallSize() {
    return this.#wallWidth;
  }

  draw() {
    if (!this.#imageFrames.complete) return;

    for (
      let wallPositionY = 0;
      wallPositionY < this.#game.height;
      wallPositionY += 50
    ) {
      this.#game.context.drawImage(
        this.#imageFrames,
        36,
        146,
        47,
        14,
        0,
        wallPositionY,
        this.#wallWidth,
        this.#wallHeight
      );
      this.#game.context.drawImage(
        this.#imageFrames,
        103,
        146,
        47,
        14,
        this.#game.width - this.#wallWidth,
        wallPositionY,
        this.#wallWidth,
        this.#wallHeight
      );
    }

    for (
      let wallPositionX = 100,
        maxPositionX = this.#game.width - this.#wallWidth;
      wallPositionX < maxPositionX;
      wallPositionX += 50
    ) {
      this.#game.context.drawImage(
        this.#imageFrames,
        86,
        97,
        14,
        47,
        wallPositionX,
        0,
        this.#wallHeight,
        this.#wallWidth
      );
      this.#game.context.drawImage(
        this.#imageFrames,
        86,
        162,
        14,
        47,
        wallPositionX,
        this.#game.height - this.#wallWidth,
        this.#wallHeight,
        this.#wallWidth
      );
    }
  }

  update(deltaTime) {}
}
