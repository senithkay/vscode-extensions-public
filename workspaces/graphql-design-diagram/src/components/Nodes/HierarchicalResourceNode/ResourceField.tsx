/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

// tslint:disable: jsx-no-multiline-js
import React, { useEffect, useRef, useState } from "react";

import { Popover } from "@material-ui/core";
import { DiagramEngine, PortModel } from "@projectstorm/react-diagrams";

import { ParametersPopup } from "../../Popup/ParametersPopup";
import { popOverStyle } from "../../Popup/styles";
import { GraphqlBasePortWidget } from "../../Port/GraphqlBasePortWidget";
import { FunctionType, ResourceFunction } from "../../resources/model";
import { FieldName, FieldType, NodeFieldContainer } from "../../resources/styles/styles";
import { FunctionMenuWidget } from "../GraphqlServiceNode/FunctionCards/FunctionMenuWidget";

import { HierarchicalNodeModel } from "./HierarchicalNodeModel";

interface ResourceFieldProps {
    engine: DiagramEngine;
    node: HierarchicalNodeModel;
    resource: ResourceFunction;
}

export function ResourceField(props: ResourceFieldProps) {
    const { engine, node, resource } = props;

    const functionPorts = useRef<PortModel[]>([]);
    const [anchorElement, setAnchorElement] = useState<HTMLDivElement | null>(null);

    const path = resource.identifier;

    useEffect(() => {
        functionPorts.current.push(node.getPortFromID(`left-${path}`));
        functionPorts.current.push(node.getPortFromID(`right-${path}`));
    }, [resource]);

    const onMouseOver = (event: React.MouseEvent<HTMLDivElement>) => {
        setAnchorElement(event.currentTarget);
    };

    const onMouseLeave = () => {
        setAnchorElement(null);
    };

    const classes = popOverStyle();

    return (
        <NodeFieldContainer>
            <GraphqlBasePortWidget
                port={node.getPort(`left-${path}`)}
                engine={engine}
            />
            <FieldName onMouseOver={onMouseOver} onMouseLeave={onMouseLeave} style={{ marginLeft: '7px' }}>
                {resource.identifier}
            </FieldName>
            <FieldType>{resource.returns}</FieldType>
            <GraphqlBasePortWidget
                port={node.getPort(`right-${path}`)}
                engine={engine}
            />

            {resource.parameters?.length > 0 && (
                <Popover
                    id="mouse-over-popover"
                    open={Boolean(anchorElement)}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                    }}
                    disableRestoreFocus={true}
                    anchorEl={anchorElement}
                    onClose={onMouseLeave}
                    className={classes.popover}
                    classes={{
                        paper: classes.popoverContent,
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'center'
                    }}
                >
                    <ParametersPopup parameters={resource.parameters}/>
                </Popover>
            )}
            {resource.subscription ?
                <FunctionMenuWidget location={resource.position} functionType={FunctionType.SUBSCRIPTION}/> :
                <FunctionMenuWidget location={resource.position} functionType={FunctionType.QUERY}/>
            }
        </NodeFieldContainer>
    );
}
