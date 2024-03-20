/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Action, ActionEvent, InputType } from "@projectstorm/react-canvas-core";
import { MappingConstructorNode, QueryExpressionNode, RequiredParamNode } from "../Node";
import { RecordFieldPortModel } from "../Port";
import { DataMapperLinkModel } from "../Link";
import { LinkConnectorNode } from "../Node/LinkConnector";

export interface PanAndZoomCanvasActionOptions {
    inverseZoom?: boolean;
}

const MIN_VISIBLE_HEIGHT = 68;

export class IONodesScrollCanvasAction extends Action {
    constructor(options: PanAndZoomCanvasActionOptions = {}) {
        super({
            type: InputType.MOUSE_WHEEL,
            fire: (actionEvent: ActionEvent<any>) => {
                const element = this.engine.getActionEventBus().getModelForEvent(actionEvent);
                if (!element) {
                    // Scroll on empty space
                    return;
                }

                const { event } = actionEvent;
                for (let layer of this.engine.getModel().getLayers()) {
                    layer.allowRepaint(false);
                }
                event.stopPropagation();

                if (element instanceof RequiredParamNode || element instanceof MappingConstructorNode) {
                    const yDelta = options.inverseZoom ? -event.deltaY : event.deltaY;
                    let newY = element.getY() - yDelta;
                    const nodeBottomY = newY + element.height;

                    if (nodeBottomY < MIN_VISIBLE_HEIGHT ) {
                        newY = MIN_VISIBLE_HEIGHT - element.height;
                    }
                    element.setPosition(element.getX(), newY > 0 ? 0 : newY);

                    // Reposition the intermediate nodes
                    if (element instanceof MappingConstructorNode) {
                        const ports = element.getPorts();
                        for (const port of Object.values(ports)) {
                            if (port instanceof RecordFieldPortModel) {
                                // Output port can only have one link, hence the first link is considered
                                const link = Object.values(port.getLinks())[0];
                                if (link instanceof DataMapperLinkModel) {
                                    const sourceNode = link.getSourcePort().getNode();
                                    const targetPortPosition = link.getTargetPort().getPosition();
                                    if (sourceNode instanceof LinkConnectorNode || sourceNode instanceof QueryExpressionNode) {
                                        sourceNode.setPosition(sourceNode.getX(), targetPortPosition.y - 4.5);
                                    }
                                }
                            }
                        }
                    }
                }

                this.engine.repaintCanvas();

                // re-enable rendering
                for (let layer of this.engine.getModel().getLayers()) {
                    layer.allowRepaint(true);
                }
            },
        });
    }
}
