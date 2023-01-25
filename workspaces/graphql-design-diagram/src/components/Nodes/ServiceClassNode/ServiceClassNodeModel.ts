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
import { ServiceClassComponent } from "../../resources/model";
import { GraphqlDesignNode } from "../BaseNode/GraphqlDesignNode";

export const SERVICE_CLASS_NODE = "serviceClassNode";

export class ServiceClassNodeModel extends GraphqlDesignNode {
    readonly classObject: ServiceClassComponent;


    constructor(classObject: ServiceClassComponent) {
        super(SERVICE_CLASS_NODE, classObject.serviceName);
        this.classObject = classObject;

        this.addPort(new GraphqlNodeBasePort(this.classObject.serviceName, PortModelAlignment.LEFT));
        this.addPort(new GraphqlNodeBasePort(this.classObject.serviceName, PortModelAlignment.RIGHT));
        this.addPort(new GraphqlNodeBasePort(this.classObject.serviceName, PortModelAlignment.TOP));

        this.classObject.functions?.forEach(classFunction => {
            this.addPort(new GraphqlNodeBasePort(classFunction.identifier, PortModelAlignment.LEFT));
            this.addPort(new GraphqlNodeBasePort(classFunction.identifier, PortModelAlignment.RIGHT));
        })
    }
}
