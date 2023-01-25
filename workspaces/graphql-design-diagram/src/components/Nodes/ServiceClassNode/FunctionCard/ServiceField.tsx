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

import { ParametersPopup } from "../../../Popup/ParametersPopup";
import { popOverStyle } from "../../../Popup/styles";
import { GraphqlBasePortWidget } from "../../../Port/GraphqlBasePortWidget";
import { ServiceClassField } from "../../../resources/model";
import { FieldName, FieldType, NodeFieldContainer } from "../../../resources/styles/styles";
import { ServiceClassNodeModel } from "../ServiceClassNodeModel";

interface ServiceFieldProps {
    engine: DiagramEngine;
    node: ServiceClassNodeModel;
    functionElement: ServiceClassField;
}

export function ServiceField(props: ServiceFieldProps) {
    const { engine, node, functionElement } = props;

    const functionPorts = useRef<PortModel[]>([]);
    const [anchorElement, setAnchorElement] = useState<HTMLDivElement | null>(null);

    const path = functionElement.identifier;

    useEffect(() => {
        functionPorts.current.push(node.getPortFromID(`left-${path}`));
        functionPorts.current.push(node.getPortFromID(`right-${path}`));
    }, [functionElement]);

    const onMouseOver = (event: React.MouseEvent<HTMLDivElement>) => {
        setAnchorElement(event.currentTarget);
    }

    const onMouseLeave = () => {
        setAnchorElement(null);
    }

    const classes = popOverStyle();

    return(
        <NodeFieldContainer>
                <GraphqlBasePortWidget
                    port={node.getPort(`left-${path}`)}
                    engine={engine}
                />
                <FieldName onMouseOver={onMouseOver} onMouseLeave={onMouseLeave} style={{marginLeft: '7px'}}>
                    {functionElement.identifier}
                </FieldName>
                <FieldType>{functionElement.returnType}</FieldType>
                <GraphqlBasePortWidget
                    port={node.getPort(`right-${path}`)}
                    engine={engine}
                />

                {functionElement.parameters.length > 0 && (
                    <Popover
                        id='mouse-over-popover'
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
                        <ParametersPopup parameters={functionElement.parameters}/>
                    </Popover>
                )}
        </NodeFieldContainer>
    );
}
