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
import { AbstractModelFactory } from "@projectstorm/react-canvas-core";
import { DiagramEngine, PortModel } from "@projectstorm/react-diagrams";

import { GraphqlNodeBasePort } from "./GraphqlNodeBasePort";

export class GraphqlBasePortFactory extends AbstractModelFactory<PortModel, DiagramEngine> {
    constructor() {
        super('graphqlBasePort');
    }

    generateModel(event: { initialConfig: any }): GraphqlNodeBasePort {
        return new GraphqlNodeBasePort(event.initialConfig.id, event.initialConfig.portType);
    }
}
