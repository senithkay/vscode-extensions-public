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
import { MediatorNodeWidget } from "./LogMediatorWidget";
import { LOG_NODE, LogMediatorNodeModel } from "./LogMediatorModel";

interface GenerateReactWidgetProps {
    model: LogMediatorNodeModel;
}

export class LogMediatorNodeFactory extends AbstractReactFactory<LogMediatorNodeModel, DiagramEngine> {
    constructor() {
        super(LOG_NODE);
    }

    generateReactWidget(event: GenerateReactWidgetProps): JSX.Element {
        return <MediatorNodeWidget
            diagramEngine={this.engine}
            node={event.model}
            width={70}
            height={70}
            level={event.model.level}
        />;
    }

    generateModel(event: { initialConfig: any }) {
        return new LogMediatorNodeModel(
            event.initialConfig.model.node,
            event.initialConfig.model.nodePosition,
            event.initialConfig.model.documentUri,
            event.initialConfig.model.isInOutSequence,
        );
    }
}
