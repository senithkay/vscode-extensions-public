/*
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */

// tslint:disable: no-implicit-dependencies
import React from "react";

import { AbstractReactFactory } from "@projectstorm/react-canvas-core";
import { DiagramEngine } from "@projectstorm/react-diagrams-core";

import { RecordNodeModel, RECORD_NODE } from "./RecordNodeModel";
import { RecordNodeWidget } from "./RecordNodeWidget";

interface GenerateReactWidgetProps {
    model: RecordNodeModel;
}

export class RecordNodeFactory extends AbstractReactFactory<RecordNodeModel, DiagramEngine> {
    constructor() {
        super(RECORD_NODE);
    }

    generateReactWidget(event: GenerateReactWidgetProps): JSX.Element {
        return <RecordNodeWidget engine={this.engine} node={event.model}/>;
    }

    generateModel(event: { initialConfig: any }) {
        return new RecordNodeModel(event.initialConfig.model);
    }
}
