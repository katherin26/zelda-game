'use strict';

export function detectDirectionCollision(sourceObject, targetObject, direction) {
    const sourceBottom = sourceObject.bottomSide;
    const sourceTop = sourceObject.topSide;
    const sourceLeftSide = sourceObject.leftSide;
    const sourceRightSide = sourceObject.rightSide;

    const targetBottom = targetObject.bottomSide;
    const targetTop = targetObject.topSide;
    const targetLeftSide = targetObject.leftSide;
    const targetRightSide = targetObject.rightSide;

    // console.log(sourceObject.orientation);
    // console.log('Source Position ', JSON.stringify({ ...sourceObject.position, sourceLeftSide, sourceRightSide, sourceBottom, sourceTop }));
    // console.log('Target Position', JSON.stringify({ ...targetObject.position, targetLeftSide, targetRightSide, targetBottom, targetTop }));

    if (direction  === 'EAST') {
        if (sourceRightSide >= targetLeftSide
            && sourceRightSide <= targetRightSide
            && sourceBottom - 10 >= targetTop
            && sourceTop + 10 <= targetBottom) return true;
    }

    if (direction === 'WEST') {
        if (sourceLeftSide <= targetRightSide
            && sourceLeftSide >= targetLeftSide
            && sourceBottom - 10 >= targetTop
            && sourceTop + 10 <= targetBottom) return true;
    }

    if (direction=== 'SOUTH') {
        if (sourceBottom >= targetTop
            && sourceBottom <= targetBottom
            && sourceLeftSide + 10 <= targetRightSide
            && sourceRightSide - 10 >= targetLeftSide) return true;
    }

    if (direction === 'NORTH') {
        if (sourceTop <= targetBottom
            && sourceTop >= targetTop
            && sourceLeftSide + 10 <= targetRightSide
            && sourceRightSide - 10 >= targetLeftSide) return true;
    }

    return false;
}

export function calculateNewCordinates(currentPosition, changeX, changeY, objectWidth, objectHeight, boundaries) {
    let nextX = currentPosition.x + changeX;
    let nextY = currentPosition.y + changeY;

    if (nextX < boundaries.w)
        nextX = boundaries.w;

    if ((nextX + objectWidth) > boundaries.e)
        nextX = boundaries.e - objectWidth;

    if (nextY < boundaries.n)
        nextY = boundaries.n;

    if ((nextY + objectHeight) > boundaries.s)
        nextY = boundaries.s - objectHeight;

    return { x: nextX, y: nextY };
}

export function detectBoundaryCollision(nextX, nextY, objectWidth, objectHeight, boundaries) {
    if (nextX < boundaries.w) return 'LEFT_COLLISION';
    if ((nextX + objectWidth) > boundaries.e) return 'RIGHT_COLLISION';
    if (nextY < boundaries.n) return 'TOP_COLLISION';
    if ((nextY + objectHeight) > boundaries.s) return 'BOTTOM_COLLISION';

    return;
}
