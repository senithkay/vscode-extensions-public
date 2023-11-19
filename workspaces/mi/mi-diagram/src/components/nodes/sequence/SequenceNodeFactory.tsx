/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

// tslint:disable: no-implicit-dependencies jsx-no-multiline-js
import React from "react";

import { AbstractReactFactory } from "@projectstorm/react-canvas-core";
import { DiagramEngine } from "@projectstorm/react-diagrams-core";
import { SEQUENCE_NODE, SequenceNodeModel } from "./SequenceNodeModel";
import { SequenceNodeWidget } from "./SequenceNodeWidget";

interface GenerateReactWidgetProps {
    model: SequenceNodeModel;
}

export class SequenceNodeFactory extends AbstractReactFactory<SequenceNodeModel, DiagramEngine> {
    constructor() {
        super(SEQUENCE_NODE);
    }

    generateReactWidget(event: GenerateReactWidgetProps): JSX.Element {
        return <SequenceNodeWidget
            diagramEngine={this.engine}
            node={event.model}
            width={event.model.width}
            height={event.model.height}
            side={event.model.isInOutSequenceNode() ? "left" : "right"}
        />;
    }

    generateModel(event: { initialConfig: GenerateReactWidgetProps }) {
        return new SequenceNodeModel(
            event.initialConfig.model.getID(),
            event.initialConfig.model.isInOutSequenceNode(),
        );
    }
}
