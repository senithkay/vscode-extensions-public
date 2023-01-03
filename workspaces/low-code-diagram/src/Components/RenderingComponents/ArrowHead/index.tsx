/*
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */
import * as React from "react";

import cn from "classnames";

import "./style.scss";

export const ARROW_HEIGHT = 5;
export const ARROW_WIDTH = 4;

export interface ArrowHeadProps {
    x: number,
    y: number,
    direction: "left" | "right" | "up" | "down",
}

interface ArrowCoordinates {
    tLx: number;
    tLy: number;
    tRx: number;
    tRy: number;
    bx: number;
    by: number;
}

export function ArrowHead(props: ArrowHeadProps) {
    const {x, y, direction} = props;
    let arrowCoordinates: ArrowCoordinates | any;
    if (direction === "down") {
        arrowCoordinates = getDownArrowCoordinates(x, y);
    } else if (direction === "up") {
        arrowCoordinates = getUpArrowCoordinates(x, y);
    } else if (direction === "right") {
        arrowCoordinates = getRightArrowCoordinates(x, y);
    } else if (direction === "left") {
        arrowCoordinates = getLeftArrowCoordinates(x, y);
    }
    const points: string = arrowCoordinates.tLx + "," + arrowCoordinates.tLy + " " + arrowCoordinates.tRx + ","
        + arrowCoordinates.tRy + " " + arrowCoordinates.bx + "," + arrowCoordinates.by;
    const arrowClass = cn("arrow");
    return (
        <g className={arrowClass}>
            <polygon points={points}/>
        </g>
    );
}

function getDownArrowCoordinates(x: number, y: number): ArrowCoordinates {
    return {
        bx: x, by: y, tLx: x - ARROW_WIDTH, tLy: y - ARROW_HEIGHT, tRx: x + ARROW_WIDTH, tRy: y - ARROW_HEIGHT
    }
}

function getUpArrowCoordinates(x: number, y: number): ArrowCoordinates {
    return {
        bx: x, by: y, tLx: x + ARROW_WIDTH, tLy: y + ARROW_HEIGHT, tRx: x - ARROW_WIDTH, tRy: y + ARROW_HEIGHT
    }
}

function getRightArrowCoordinates(x: number, y: number): ArrowCoordinates {
    return {
        bx: x, by: y, tLx: x - ARROW_HEIGHT, tLy: y - ARROW_WIDTH, tRx: x - ARROW_HEIGHT, tRy: y + ARROW_WIDTH
    }
}

function getLeftArrowCoordinates(x: number, y: number): ArrowCoordinates {
    return {
        bx: x, by: y, tLx: x + ARROW_HEIGHT, tLy: y + ARROW_WIDTH, tRx: x + ARROW_HEIGHT, tRy: y - ARROW_WIDTH
    }
}
