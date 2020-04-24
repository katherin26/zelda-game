'use strict';

export function detectCollision(sourceObject, targetObject) {
    const {
        abLine: sourceAbLine,
        acLine: sourceAcLine,
        cdLine: sourceCdLine,
        bdLine: sourceBdLine } = getLinesFromVertices(sourceObject.vertices);

    const {
        abLine: targetAbLine,
        acLine: targetAcLine,
        cdLine: targetCdLine,
        bdLine: targetBdLine } = getLinesFromVertices(targetObject.vertices);

    console.log('Detecting collision');
    console.log({ sourceAbLine, sourceAcLine, sourceCdLine, sourceBdLine });
    console.log({ targetAbLine, targetAcLine, targetCdLine, targetBdLine });

    if (sourceObject.orientation === 'SOUTH')
        if (detectLineCollision(sourceAbLine, targetCdLine, 'y', 'negative', sourceObject.height))
            return { collidedObject: targetObject, collisionSide: 'TOP_COLLISION' };

    if (sourceObject.orientation === 'EAST')
        if (detectLineCollision(sourceBdLine, targetAcLine, 'x', 'positive', sourceObject.width))
            return { collidedObject: targetObject, collisionSide: 'RIGHT_COLLISION' };

    if (sourceObject.orientation === 'NORTH')
        if (detectLineCollision(sourceCdLine, targetAbLine, 'y', 'positive', sourceObject.height))
            return { collidedObject: targetObject, collisionSide: 'BOTTOM_COLLISION' };

    if (sourceObject.orientation === 'WEST')
        if (detectLineCollision(sourceAcLine, targetBdLine, 'x', 'negative', sourceObject.width))
            return { collidedObject: targetObject, collisionSide: 'LEFT_COLLISION' };

    if (targetObject.orientation === 'SOUTH')
        if (detectLineCollision(targetAbLine, sourceCdLine, 'y', 'negative', targetObject.height))
            return { collidedObject: sourceObject, collisionSide: 'TOP_COLLISION' };

    if (targetObject.orientation === 'EAST')
        if (detectLineCollision(targetBdLine, sourceAcLine, 'x', 'positive', targetObject.width))
            return { collidedObject: sourceObject, collisionSide: 'RIGHT_COLLISION' };

    if (targetObject.orientation === 'NORTH')
        if (detectLineCollision(targetCdLine, sourceAbLine, 'y', 'positive', targetObject.height))
            return { collidedObject: sourceObject, collisionSide: 'BOTTOM_COLLISION' };

    if (targetObject.orientation === 'WEST')
        if (detectLineCollision(targetAcLine, sourceBdLine, 'x', 'negative', targetObject.width))
            return { collidedObject: sourceObject, collisionSide: 'LEFT_COLLISION' };

    return;
}

function getLinesFromVertices(vertices) {
    const abLine = {
        x1: vertices.a.x,
        y1: vertices.a.y,
        x2: vertices.b.x,
        y2: vertices.b.y
    };

    const acLine = {
        x1: vertices.a.x,
        y1: vertices.a.y,
        x2: vertices.c.x,
        y2: vertices.c.y
    };

    const cdLine = {
        x1: vertices.c.x,
        y1: vertices.c.y,
        x2: vertices.d.x,
        y2: vertices.d.y
    };

    const bdLine = {
        x1: vertices.b.x,
        y1: vertices.b.y,
        x2: vertices.d.x,
        y2: vertices.d.y
    };

    return { abLine, acLine, cdLine, bdLine };
}

function detectLineCollision(line1, line2, axis, direction, range) {
    let collidedInDirectionAxis = false;

    if (axis === 'y' && direction === 'negative')
        collidedInDirectionAxis = (line1.y1 <= line2.y1 && line1.y1 >= (line2.y1 - range)) || (line1.y2 <= line2.y2 && line1.y2 >= (line2.y2 - range));

    if (axis === 'y' && direction === 'positive')
        collidedInDirectionAxis = (line1.y1 >= line2.y1 && line1.y1 <= (line2.y1 + range)) || (line1.y2 >= line2.y2 && line1.y2 <= (line2.y2 + range));

    if (axis === 'x' && direction === 'negative')
        collidedInDirectionAxis = (line1.x1 <= line2.x1 && line1.x1 >= (line2.x1 - range)) || (line1.x2 <= line2.x2 && line1.x2 >= (line2.x2 - range));

    if (axis === 'x' && direction === 'positive')
        collidedInDirectionAxis = (line1.x1 >= line2.x1 && line1.x1 <= (line2.x1 + range)) || (line1.x2 >= line2.x2 && line1.x2 <= (line2.x2 + range));

    if (collidedInDirectionAxis) {
        if (axis == 'y') {
            return ((line1.x1 >= line2.x1 && line1.x1 <= line2.x2) || (line1.x2 >= line2.x1 && line1.x2 <= line2.x2)
                || (line2.x1 >= line1.x1 && line2.x1 <= line1.x2) || (line2.x2 >= line1.x1 && line2.x2 <= line1.x2));
        }

        if (axis == 'x') {
            return ((line1.y1 >= line2.y1 && line1.y1 <= line2.y2) || (line1.y2 >= line2.y1 && line1.y2 <= line2.y2)
                || (line2.y1 >= line1.y1 && line2.y1 <= line1.y2) || (line2.y2 >= line1.y1 && line2.y2 <= line1.y2));
        }
    }

    return false;
}