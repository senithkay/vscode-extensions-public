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
import React, { useEffect, useRef, useState } from "react";

import { Popover } from "@material-ui/core";
import { DiagramEngine, PortModel } from "@projectstorm/react-diagrams";


import { ResourceFunction } from "../../resources/model";
import { HierarchicalNodeModel } from "./HierarchicalNodeModel";
import { ParametersPopup } from "../../Popup/ParametersPopup";
import { popOverStyle } from "../../Popup/styles";
import { GraphqlBasePortWidget } from "../../Port/GraphqlBasePortWidget";
import { NodeFieldContainer, FieldName, FieldType } from "../../resources/styles/styles";

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
        </NodeFieldContainer>
    );
}
