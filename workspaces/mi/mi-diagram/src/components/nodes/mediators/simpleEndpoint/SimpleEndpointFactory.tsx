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
import { EndpointNodeWidget } from "./SimpleEndpointWidget";
import { SIMPLE_ENDPOINT, SimpleEndpointNodeModel } from "./SimpleEndpointModel";

interface GenerateReactWidgetProps {
    model: SimpleEndpointNodeModel;
}

export class SimpleEndpointNodeFactory extends AbstractReactFactory<SimpleEndpointNodeModel, DiagramEngine> {
    constructor() {
        super(SIMPLE_ENDPOINT);
    }

    generateReactWidget(event: GenerateReactWidgetProps): JSX.Element {
        return <EndpointNodeWidget
            diagramEngine={this.engine}
            node={event.model}
            name={event.model.endpointName}
            description={event.model.endpointDescription}
            documentUri={event.model.getDocumentUri()}
            nodePosition={event.model.getNodeRange()}
        />;
    }

    generateModel(event: { initialConfig: GenerateReactWidgetProps }) {
        return new SimpleEndpointNodeModel({
            node: event.initialConfig.model.getNode(),
            name: event.initialConfig.model.endpointName,
            description: event.initialConfig.model.endpointDescription,
            documentUri: event.initialConfig.model.getDocumentUri(),
            sequenceType: event.initialConfig.model.getSequenceType(),
            subSequences: event.initialConfig.model.subSequences,
        });
    }
}
