/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import {
    AbstractDisplacementState,
    AbstractDisplacementStateEvent,
    Action,
    ActionEvent,
    InputType,
} from "@projectstorm/react-canvas-core";
import { DiagramEngine, LinkModel, DragNewLinkStateOptions } from "@projectstorm/react-diagrams-core";
import { DefaultNodeModel, DefaultPortModel } from "../components/default";

export class DragNewLinkState extends AbstractDisplacementState<DiagramEngine> {
    port: DefaultPortModel;
    link: LinkModel;
    config: DragNewLinkStateOptions;

    constructor(options: DragNewLinkStateOptions = {}) {
        super({ name: "drag-new-link" });

        this.config = {
            allowLooseLinks: false,
            allowLinksFromLockedPorts: false,
            ...options,
        };

        this.registerAction(
            new Action({
                type: InputType.MOUSE_DOWN,
                fire: (event: ActionEvent<any, any>) => {
                    this.port = this.engine.getMouseElement(event.event) as DefaultPortModel;
                    if (!this.config.allowLinksFromLockedPorts && this.port.isLocked()) {
                        this.eject();
                        return;
                    }
                    this.link = this.port.createLinkModel();

                    // if no link is given, just eject the state
                    if (!this.link) {
                        this.eject();
                        return;
                    }
                    this.link.setSelected(true);
                    this.link.setSourcePort(this.port);
                    this.engine.getModel().addLink(this.link);
                    this.port.reportPosition();
                },
            })
        );

        this.registerAction(
            new Action({
                type: InputType.MOUSE_UP,
                fire: (event: ActionEvent<any>) => {
                    const model = this.engine.getMouseElement(event.event);
                    // handle linking to a port
                    if (model instanceof DefaultPortModel) {
                        if (this.port.canLinkToPort(model) && !model.hasLinks()) {
                            this.link.setTargetPort(model);
                            model.reportPosition();
                            this.engine.repaintCanvas();
                            return;
                        } else if (this.port.canLinkToPort(model) && model.hasLinks()) {
                            // create a new port and link
                            const nodeModel = model.getParent() as DefaultNodeModel;
                            const nextPortId = nodeModel.getNextPortID();
                            const port = nodeModel.addInPort(nextPortId);
                            this.link.setTargetPort(port);
                            port.reportPosition();
                            this.engine.repaintCanvas();
                            return;
                        } else {
                            this.link.remove();
                            this.engine.repaintCanvas();
                            return;
                        }
                    }
                    // handle link drop on node
                    if (model instanceof DefaultNodeModel) {
                        if ((this.port as DefaultPortModel).getOptions().in) {
                            this.link.remove();
                            this.engine.repaintCanvas();
                            return;
                        }
                        const availablePort = model.getAvailableInPort();
                        if (availablePort) {
                            this.link.setTargetPort(availablePort);
                            availablePort.reportPosition();
                            this.engine.repaintCanvas();
                            return;
                        }
                        const nextPortId = model.getNextPortID();
                        const port = model.addInPort(nextPortId);
                        this.link.setTargetPort(port);
                        port.reportPosition();
                        this.engine.repaintCanvas();
                        return;
                    }

                    if (!this.config.allowLooseLinks) {
                        this.link.remove();
                        this.engine.repaintCanvas();
                    }
                },
            })
        );
    }

    fireMouseMoved(event: AbstractDisplacementStateEvent): any {
        const portPos = this.port.getPosition();
        const zoomLevelPercentage = this.engine.getModel().getZoomLevel() / 100;
        const engineOffsetX = this.engine.getModel().getOffsetX() / zoomLevelPercentage;
        const engineOffsetY = this.engine.getModel().getOffsetY() / zoomLevelPercentage;
        const initialXRelative = this.initialXRelative / zoomLevelPercentage;
        const initialYRelative = this.initialYRelative / zoomLevelPercentage;
        const linkNextX = portPos.x - engineOffsetX + (initialXRelative - portPos.x) + event.virtualDisplacementX;
        const linkNextY = portPos.y - engineOffsetY + (initialYRelative - portPos.y) + event.virtualDisplacementY;

        this.link.getLastPoint().setPosition(linkNextX, linkNextY);
        this.engine.repaintCanvas();
    }
}
