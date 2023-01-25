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

// tslint:disable: no-implicit-dependencies jsx-no-multiline-js
import React from "react";

import { AbstractReactFactory } from "@projectstorm/react-canvas-core";
import { DiagramEngine } from "@projectstorm/react-diagrams-core";

import { GraphqlServiceNodeModel, GRAPHQL_SERVICE_NODE } from "./GraphqlServiceNodeModel";
import { GraphqlServiceNodeWidget } from "./GraphqlServiceNodeWidget";

interface GenerateReactWidgetProps {
    model: GraphqlServiceNodeModel;
}

export class GraphqlServiceNodeFactory extends AbstractReactFactory<GraphqlServiceNodeModel, DiagramEngine> {
    constructor() {
        super(GRAPHQL_SERVICE_NODE);
    }

    generateReactWidget(event: GenerateReactWidgetProps): JSX.Element {
        return <GraphqlServiceNodeWidget engine={this.engine} node={event.model} />;
    }

    generateModel(event: { initialConfig: any }) {
        return new GraphqlServiceNodeModel(event.initialConfig.model);
    }
}
