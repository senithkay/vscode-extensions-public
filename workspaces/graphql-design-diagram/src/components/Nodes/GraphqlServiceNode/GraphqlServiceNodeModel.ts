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
import { Service } from "../../resources/model";
import { GraphqlDesignNode } from "../BaseNode/GraphqlDesignNode";

export const GRAPHQL_SERVICE_NODE = "graphqlServiceNode";

export class GraphqlServiceNodeModel extends GraphqlDesignNode {
    readonly serviceObject: Service;


    // TODO:
    //  check for empty service names
    constructor(serviceObject: Service) {
        super(GRAPHQL_SERVICE_NODE, serviceObject.serviceName);
        this.serviceObject = serviceObject;

        this.addPort(new GraphqlNodeBasePort(this.serviceObject.serviceName, PortModelAlignment.LEFT));
        this.addPort(new GraphqlNodeBasePort(this.serviceObject.serviceName, PortModelAlignment.RIGHT));
        this.addPort(new GraphqlNodeBasePort(this.serviceObject.serviceName, PortModelAlignment.TOP));

        this.serviceObject.resourceFunctions.forEach(resource => {
            this.addPort(new GraphqlNodeBasePort(resource.identifier, PortModelAlignment.LEFT));
            this.addPort(new GraphqlNodeBasePort(resource.identifier, PortModelAlignment.RIGHT));
        });
        if (this.serviceObject.remoteFunctions){
            this.serviceObject.remoteFunctions.forEach(remoteFunc => {
                this.addPort(new GraphqlNodeBasePort(remoteFunc.identifier, PortModelAlignment.LEFT));
                this.addPort(new GraphqlNodeBasePort(remoteFunc.identifier, PortModelAlignment.RIGHT));
            })
        }
    }
}
