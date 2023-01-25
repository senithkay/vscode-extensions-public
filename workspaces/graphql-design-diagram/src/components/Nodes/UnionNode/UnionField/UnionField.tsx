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

import React, { useEffect, useRef } from "react";

import { DiagramEngine, PortModel } from "@projectstorm/react-diagrams";

import { GraphqlBasePortWidget } from "../../../Port/GraphqlBasePortWidget";
import { Interaction } from "../../../resources/model";
import { FieldName, NodeFieldContainer } from "../../../resources/styles/styles";
import { UnionNodeModel } from "../UnionNodeModel";

interface UnionFieldProps {
    engine: DiagramEngine;
    node: UnionNodeModel;
    unionField: Interaction;
}

export function UnionField(props: UnionFieldProps) {
    const { engine, node, unionField } = props;

    const functionPorts = useRef<PortModel[]>([]);

    const field = unionField.componentName;

    useEffect(() => {
        functionPorts.current.push(node.getPortFromID(`left-${field}`));
        functionPorts.current.push(node.getPortFromID(`right-${field}`));
    }, [unionField]);

    return(
        <NodeFieldContainer>
            <GraphqlBasePortWidget
                port={node.getPort(`left-${field}`)}
                engine={engine}
            />
            <FieldName style={{marginLeft: '7px'}}>
                {field}
            </FieldName>
            <GraphqlBasePortWidget
                port={node.getPort(`right-${field}`)}
                engine={engine}
            />
        </NodeFieldContainer>
    );
}
