/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { DefaultLinkModel } from "@projectstorm/react-diagrams";
import { Colors } from "../../resources/constants";

export class NodeLinkModel extends DefaultLinkModel {
    constructor() {
        super({
            type: "node-link",
            width: 10,
            color: Colors.PRIMARY,
            selectedColor: Colors.SECONDARY,
            curvyness: 0,
        });
    }

    getSVGPath(): string {
        if (this.points.length == 2) {
            let source = this.getFirstPoint().getPosition();
            let target = this.getLastPoint().getPosition();
            // is lines are straight?
            let tolerance = 10;
            let isStraight = Math.abs(source.y - target.y) <= tolerance || Math.abs(source.x - target.x) <= tolerance;
            if (isStraight) {
                let path = `M ${source.x} ${source.y} `;
                path += `L ${target.x} ${target.y}`;
                return path;
            }

            // generate 2 angle lines
            let bottomOffset = 30;
            let curveOffset = 10;
            // is the target on the right?
            let isRight = source.x < target.x;

            let path = `M ${source.x} ${source.y} `;
            path += `L ${source.x} ${target.y - bottomOffset - curveOffset} `;
            if (isRight) {
                path += `A ${curveOffset},${curveOffset} 0 0 0 ${source.x + curveOffset},${target.y - bottomOffset} `;
                path += `L ${target.x - curveOffset} ${target.y - bottomOffset} `;
                path += `A ${curveOffset},${curveOffset} 0 0 1 ${target.x},${target.y - bottomOffset + curveOffset} `;
            } else {
                path += `A ${curveOffset},${curveOffset} 0 0 1 ${source.x - curveOffset},${target.y - bottomOffset} `;
                path += `L ${target.x + curveOffset} ${target.y - bottomOffset} `;
                path += `A ${curveOffset},${curveOffset} 0 0 0 ${target.x},${target.y - bottomOffset + curveOffset} `;
            }
            path += `L ${target.x} ${target.y}`;
            return path;
        }
    }
}
