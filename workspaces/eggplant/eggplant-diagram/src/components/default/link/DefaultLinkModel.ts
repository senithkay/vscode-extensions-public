/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import {
    LabelModel,
    LinkModel,
    LinkModelGenerics,
    LinkModelListener,
    PointModel,
    PointModelGenerics,
    PortModel,
    PortModelAlignment,
} from "@projectstorm/react-diagrams-core";
import { DefaultLabelModel } from "../label/DefaultLabelModel";
import { BezierCurve } from "@projectstorm/geometry";
import { BaseEvent, BaseModelOptions, DeserializeEvent } from "@projectstorm/react-canvas-core";
import { Colors } from "../../../resources";

export interface DefaultLinkModelListener extends LinkModelListener {
    colorChanged?(event: BaseEvent): void;
    widthChanged?(event: BaseEvent): void;
}

export interface DefaultLinkModelOptions extends BaseModelOptions {
    width?: number;
    color?: string;
    selectedColor?: string;
    curvyness?: number;
    type?: string;
    testName?: string;
    receiver?: string;
}

export interface DefaultLinkModelGenerics extends LinkModelGenerics {
    LISTENER: DefaultLinkModelListener;
    OPTIONS: DefaultLinkModelOptions;
}

export class DefaultLinkModel extends LinkModel<DefaultLinkModelGenerics> {
    constructor(options: DefaultLinkModelOptions = {}) {
        super({
            type: "default",
            width: options.width || 2,
            color: options.color || Colors.PRIMARY,
            selectedColor: options.selectedColor || Colors.SECONDARY,
            curvyness: 50,
            ...options,
        });
    }

    calculateControlOffset(port: PortModel): [number, number] {
        if (port.getOptions().alignment === PortModelAlignment.RIGHT) {
            return [this.options.curvyness, 0];
        } else if (port.getOptions().alignment === PortModelAlignment.LEFT) {
            return [-this.options.curvyness, 0];
        } else if (port.getOptions().alignment === PortModelAlignment.TOP) {
            return [0, -this.options.curvyness];
        }
        return [0, this.options.curvyness];
    }

    getSVGPath(): string {
        if (this.points.length == 2) {
            const curve = new BezierCurve();
            curve.setSource(this.getFirstPoint().getPosition());
            curve.setTarget(this.getLastPoint().getPosition());
            curve.setSourceControl(this.getFirstPoint().getPosition().clone());
            curve.setTargetControl(this.getLastPoint().getPosition().clone());

            if (this.sourcePort) {
                curve.getSourceControl().translate(...this.calculateControlOffset(this.getSourcePort()));
            }

            if (this.targetPort) {
                curve.getTargetControl().translate(...this.calculateControlOffset(this.getTargetPort()));
            }
            return curve.getSVGCurve();
        }
    }

    serialize() {
        return {
            ...super.serialize(),
            width: this.options.width,
            color: this.options.color,
            curvyness: this.options.curvyness,
            selectedColor: this.options.selectedColor,
        };
    }

    deserialize(event: DeserializeEvent<this>) {
        super.deserialize(event);
        this.options.color = event.data.color;
        this.options.width = event.data.width;
        this.options.curvyness = event.data.curvyness;
        this.options.selectedColor = event.data.selectedColor;
    }

    addLabel(label: LabelModel | string) {
        if (label instanceof LabelModel) {
            return super.addLabel(label);
        }
        let labelOb = new DefaultLabelModel();
        labelOb.setLabel(label);
        return super.addLabel(labelOb);
    }

    setWidth(width: number) {
        this.options.width = width;
        this.fireEvent({ width }, "widthChanged");
    }

    setColor(color: string) {
        this.options.color = color;
        this.fireEvent({ color }, "colorChanged");
    }

    addPoint<P extends PointModel<PointModelGenerics>>(pointModel: P, index?: number): P {
        return;
    }

    setReceiver(node: string) {
        this.options.receiver = node;
    }
}
