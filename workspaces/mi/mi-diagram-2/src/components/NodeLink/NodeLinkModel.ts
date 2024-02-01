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

export const LINK_BOTTOM_OFFSET = 30;

export class NodeLinkModel extends DefaultLinkModel {
    label: string;
    linkBottomOffset: number;

    constructor(label?: string) {
        super({
            type: "node-link",
            width: 10,
            color: Colors.PRIMARY,
            selectedColor: Colors.SECONDARY,
            curvyness: 0,
        });
        if (label) {
            this.label = label;
            this.linkBottomOffset = LINK_BOTTOM_OFFSET + 40;
        } else {
            this.linkBottomOffset = LINK_BOTTOM_OFFSET;
        }
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
            let curveOffset = 10;
            // is the target on the right?
            let isRight = source.x < target.x;

            let path = `M ${source.x} ${source.y} `;
            path += `L ${source.x} ${target.y - this.linkBottomOffset - curveOffset} `;
            if (isRight) {
                path += `A ${curveOffset},${curveOffset} 0 0 0 ${source.x + curveOffset},${
                    target.y - this.linkBottomOffset
                } `;
                path += `L ${target.x - curveOffset} ${target.y - this.linkBottomOffset} `;
                path += `A ${curveOffset},${curveOffset} 0 0 1 ${target.x},${
                    target.y - this.linkBottomOffset + curveOffset
                } `;
            } else {
                path += `A ${curveOffset},${curveOffset} 0 0 1 ${source.x - curveOffset},${
                    target.y - this.linkBottomOffset
                } `;
                path += `L ${target.x + curveOffset} ${target.y - this.linkBottomOffset} `;
                path += `A ${curveOffset},${curveOffset} 0 0 0 ${target.x},${
                    target.y - this.linkBottomOffset + curveOffset
                } `;
            }
            path += `L ${target.x} ${target.y}`;
            return path;
        }
    }

    // get label coordinates
    getLabelPosition(): { x: number; y: number } {
        if (this.points.length == 2) {
            let source = this.getFirstPoint().getPosition();
            let target = this.getLastPoint().getPosition();

            // is lines are straight?
            let tolerance = 10;
            let isStraight = Math.abs(source.y - target.y) <= tolerance || Math.abs(source.x - target.x) <= tolerance;
            if (isStraight) {
                // is horizontal?
                if (Math.abs(source.y - target.y) <= tolerance) {
                    return { x: (source.x + target.x) / 2, y: source.y + 5 };
                }
                return { x: (source.x + target.x) / 2, y: (source.y + target.y) / 2 };
            }

            // generate for 2 angle lines
            let x = target.x;
            let y = target.y - this.linkBottomOffset / 2 + 4;
            return { x: x, y: y };
        }
    }
}
