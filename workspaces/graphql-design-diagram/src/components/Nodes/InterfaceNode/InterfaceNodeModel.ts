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

import { PortModelAlignment } from "@projectstorm/react-diagrams";

import { GraphqlNodeBasePort } from "../../Port/GraphqlNodeBasePort";
import { InterfaceComponent } from "../../resources/model";
import { GraphqlDesignNode } from "../BaseNode/GraphqlDesignNode";

export const INTERFACE_NODE = "interfaceNode";

export class InterfaceNodeModel extends GraphqlDesignNode {
    readonly interfaceObject: InterfaceComponent;


    constructor(interfaceObject: InterfaceComponent) {
        super(INTERFACE_NODE, interfaceObject.name);
        this.interfaceObject = interfaceObject;

        this.addPort(new GraphqlNodeBasePort(this.interfaceObject.name, PortModelAlignment.LEFT));
        this.addPort(new GraphqlNodeBasePort(this.interfaceObject.name, PortModelAlignment.RIGHT));
        this.addPort(new GraphqlNodeBasePort(this.interfaceObject.name, PortModelAlignment.TOP));

        this.interfaceObject.resourceFunctions?.forEach(resourceFunction => {
            this.addPort(new GraphqlNodeBasePort(resourceFunction.identifier, PortModelAlignment.LEFT));
            this.addPort(new GraphqlNodeBasePort(resourceFunction.identifier, PortModelAlignment.RIGHT));
        });

        this.interfaceObject.possibleTypes.forEach(possibleType => {
            this.addPort(new GraphqlNodeBasePort(possibleType.componentName, PortModelAlignment.LEFT));
            this.addPort(new GraphqlNodeBasePort(possibleType.componentName, PortModelAlignment.RIGHT));
        });
    }
}
