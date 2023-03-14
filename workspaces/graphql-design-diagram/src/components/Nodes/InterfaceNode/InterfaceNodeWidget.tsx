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

// tslint:disable: jsx-no-multiline-js
import React from "react";

import { DiagramEngine } from "@projectstorm/react-diagrams";

import { NodeFieldContainer } from "../../resources/styles/styles";
import { ServiceNode } from "../GraphqlServiceNode/styles/styles";

import { InterfaceHeadWidget } from "./InterfaceHead/InterfaceHead";
import { InterfaceImplWidget } from "./InterfaceImplementation/InterfaceImplementation";
import { InterfaceNodeModel } from "./InterfaceNodeModel";
import { ResourceFunctionCard } from "./ResourceFunctionCard/ResourceFunctionCard";

interface InterfaceNodeWidgetProps {
    node: InterfaceNodeModel;
    engine: DiagramEngine;
}

export function InterfaceNodeWidget(props: InterfaceNodeWidgetProps) {
    const { node, engine } = props;

    return (
        <ServiceNode>
            <InterfaceHeadWidget node={node} engine={engine}/>
            {node.interfaceObject.resourceFunctions?.map((resourceFunction, index) => {
                return (
                    <ResourceFunctionCard key={index} node={node} engine={engine} functionElement={resourceFunction}/>
                );
            })}
            {node.interfaceObject.possibleTypes.length > 0 && (
                <NodeFieldContainer>
                    <div>Implementations</div>
                </NodeFieldContainer>
            )}
            {node.interfaceObject.possibleTypes.map((possibleType, index) => {
                return (
                    <InterfaceImplWidget key={index} node={node} engine={engine} field={possibleType}/>
                );
            })}
        </ServiceNode>
    );
}
