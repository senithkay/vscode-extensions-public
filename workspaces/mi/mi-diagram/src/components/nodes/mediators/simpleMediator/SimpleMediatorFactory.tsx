/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from "react";

import { AbstractReactFactory } from "@projectstorm/react-canvas-core";
import { DiagramEngine } from "@projectstorm/react-diagrams-core";
import { MediatorNodeWidget } from "./SimpleMediatorWidget";
import { SIMPLE_NODE, SimpleMediatorNodeModel } from "./SimpleMediatorModel";

interface GenerateReactWidgetProps {
    model: SimpleMediatorNodeModel;
}

export class SimpleMediatorNodeFactory extends AbstractReactFactory<SimpleMediatorNodeModel, DiagramEngine> {
    constructor() {
        super(SIMPLE_NODE);
    }

    generateReactWidget(event: GenerateReactWidgetProps): JSX.Element {
        return <MediatorNodeWidget
            diagramEngine={this.engine}
            node={event.model}
            name={event.model.mediatorName}
            description={event.model.mediatorDescription}
            documentUri={event.model.getDocumentUri()}
            nodePosition={event.model.getNodeRange()}
        />;
    }

    generateModel(event: { initialConfig: GenerateReactWidgetProps }) {
        return new SimpleMediatorNodeModel({
            node: event.initialConfig.model.getNode(),
            name: event.initialConfig.model.mediatorName,
            description: event.initialConfig.model.mediatorDescription,
            documentUri: event.initialConfig.model.getDocumentUri(),
            sequenceType: event.initialConfig.model.getSequenceType(),
        });
    }
}
