/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { DefaultLinkModel } from "@projectstorm/react-diagrams";
import { Colors, NODE_LINK } from "../../resources/constants";
import { NodeModel } from "../../utils/types";

export const LINK_BOTTOM_OFFSET = 30;

export interface NodeLinkModelOptions {
    label?: string;
    showAddButton?: boolean; // default true
    showArrow?: boolean; // default true
    brokenLine?: boolean; // default false
    alignBottom?: boolean; // default false
    onAddClick?: () => void;
}

export class NodeLinkModel extends DefaultLinkModel {
    label: string;
    sourceNode: NodeModel;
    targetNode: NodeModel;
    // options
    showArrow: boolean;
    showAddButton = true;
    brokenLine = false;
    alignBottom = false;
    linkBottomOffset = LINK_BOTTOM_OFFSET;
    onAddClick?: () => void;

    constructor(label?: string);
    constructor(options: NodeLinkModelOptions);
    constructor(options: NodeLinkModelOptions | string) {
        super({
            type: NODE_LINK,
            width: 10,
            color: Colors.PRIMARY,
            selectedColor: Colors.SECONDARY,
            curvyness: 0,
        });
        // if (options) {
        //     if (typeof options === "string" && options.length > 0) {
        //         this.label = options;
        //         this.linkBottomOffset = LINK_BOTTOM_OFFSET + 40;
        //     } else {
        //         if ((options as NodeLinkModelOptions).label) {
        //             this.label = (options as NodeLinkModelOptions).label;
        //         }
        //         if ((options as NodeLinkModelOptions).showAddButton === false) {
        //             this.showAddButton = (options as NodeLinkModelOptions).showAddButton;
        //         }
        //         if ((options as NodeLinkModelOptions).showArrow) {
        //             this.showArrow = (options as NodeLinkModelOptions).showArrow;
        //         }
        //         if ((options as NodeLinkModelOptions).brokenLine === true) {
        //             this.brokenLine = (options as NodeLinkModelOptions).brokenLine;
        //         }
        //         if ((options as NodeLinkModelOptions).alignBottom === true) {
        //             this.alignBottom = (options as NodeLinkModelOptions).alignBottom;
        //         }
        //     }
        //     if ((options as NodeLinkModelOptions).onAddClick) {
        //         this.onAddClick = (options as NodeLinkModelOptions).onAddClick;
        //     }
        // }
    }

    setSourceNode(node: NodeModel) {
        this.sourceNode = node;
    }

    setTargetNode(node: NodeModel) {
        this.targetNode = node;
    }


    // get add button position
    getAddButtonPosition(): { x: number; y: number } {
        if (this.points.length != 2 && !this.showAddButton) {
            return { x: 0, y: 0 };
        }

        let source = this.getFirstPoint().getPosition();
        let target = this.getLastPoint().getPosition();

        // is lines are straight?
        let tolerance = 10;
        let isStraight = Math.abs(source.y - target.y) <= tolerance || Math.abs(source.x - target.x) <= tolerance;
        if (isStraight) {
            // with label
            if (this.label) {
                return { x: (source.x + target.x) / 2, y: (source.y + target.y) / 2 + 2 };
            }
            // without label
            return { x: (source.x + target.x) / 2, y: (source.y + target.y) / 2 - 5 };
        }

        // generate for 2 angle lines
        const bendY = this.alignBottom ? target.y : source.y + this.linkBottomOffset;
        return { x: (source.x + target.x) / 2, y: bendY - 2 };
    }

    // show node arrow. default true. but target node is a EmptyNodeModel, then false
    showArrowToNode(): boolean {
        if (this.showArrow) {
            return this.showArrow;
        }
        if (this.points.length != 2) {
            return false;
        }
        return true;
    }
}
