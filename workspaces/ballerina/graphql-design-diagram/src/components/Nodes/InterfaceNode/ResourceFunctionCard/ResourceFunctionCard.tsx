/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

// tslint:disable: jsx-no-multiline-js
import React, { useEffect, useRef, useState } from "react";

import { DiagramEngine, PortModel } from "@projectstorm/react-diagrams";
import { Popover } from "@wso2-enterprise/ui-toolkit";

import { useGraphQlContext } from "../../../DiagramContext/GraphqlDiagramContext";
import { ParametersPopup } from "../../../Popup/ParametersPopup";
import { popOverCompStyle } from "../../../Popup/styles";
import { GraphqlBasePortWidget } from "../../../Port/GraphqlBasePortWidget";
import { ResourceFunction } from "../../../resources/model";
import { FieldName, FieldType, NodeFieldContainer } from "../../../resources/styles/styles";
import { InterfaceNodeModel } from "../InterfaceNodeModel";

interface ResourceFunctionCardProps {
    engine: DiagramEngine;
    node: InterfaceNodeModel;
    functionElement: ResourceFunction;
}

export function ResourceFunctionCard(props: ResourceFunctionCardProps) {
    const { engine, node, functionElement } = props;
    const { setSelectedNode } = useGraphQlContext();

    const functionPorts = useRef<PortModel[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [anchorEvent, setAnchorEvent] = useState<null | HTMLElement>(null);

    const path = functionElement.identifier;

    useEffect(() => {
        functionPorts.current.push(node.getPortFromID(`left-${path}`));
        functionPorts.current.push(node.getPortFromID(`right-${path}`));
    }, [functionElement]);


    const openPanel = (event: React.MouseEvent<HTMLElement>) => {
        setIsOpen(true);
        setAnchorEvent(event.currentTarget);
    };
    const closePanel = () => {
        setIsOpen(false);
        setAnchorEvent(null);
    };

    const updateSelectedNode = () => {
        setSelectedNode(functionElement.returns);
    }


    return (
        <NodeFieldContainer data-testid={`interface-func-field-${functionElement.identifier}`}>
            <GraphqlBasePortWidget
                port={node.getPort(`left-${path}`)}
                engine={engine}
            />
            <FieldName
                onMouseOver={openPanel}
                onMouseLeave={closePanel}
                style={{ marginLeft: '7px' }}
                data-testid={`interface-func-${functionElement.identifier}`}
            >
                {functionElement.identifier}
            </FieldName>
            <div onClick={updateSelectedNode}>
                <FieldType data-testid={`interface-func-type-${functionElement.returns}`}>{functionElement.returns}</FieldType>
            </div>
            <GraphqlBasePortWidget
                port={node.getPort(`right-${path}`)}
                engine={engine}
            />

            {functionElement.parameters?.length > 0 && (
                <Popover
                    anchorOrigin={
                        {
                            vertical: "bottom",
                            horizontal: "center",
                        }
                    }
                    transformOrigin={
                        {
                            vertical: "center",
                            horizontal: "left",
                        }
                    }
                    sx={popOverCompStyle}
                    open={isOpen}
                    anchorEl={anchorEvent}
                >
                    <ParametersPopup parameters={functionElement.parameters} />
                </Popover>
            )}
        </NodeFieldContainer>
    );
}
