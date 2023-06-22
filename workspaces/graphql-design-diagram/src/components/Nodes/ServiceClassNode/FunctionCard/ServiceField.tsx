/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

// tslint:disable: jsx-no-multiline-js jsx-no-lambda jsx-wrap-multiline
import React, { useEffect, useRef, useState } from "react";

import { Popover } from "@material-ui/core";
import { DiagramEngine, PortModel } from "@projectstorm/react-diagrams";

import { ChildActionMenu } from "../../../NodeActionMenu/ChildActionMenu";
import { ParametersPopup } from "../../../Popup/ParametersPopup";
import { popOverStyle } from "../../../Popup/styles";
import { GraphqlBasePortWidget } from "../../../Port/GraphqlBasePortWidget";
import { FunctionType, ServiceClassField } from "../../../resources/model";
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
    const [isHovered, setIsHovered] = useState<boolean>(false);

    const path = functionElement.identifier;

    useEffect(() => {
        functionPorts.current.push(node.getPortFromID(`left-${path}`));
        functionPorts.current.push(node.getPortFromID(`right-${path}`));
    }, [functionElement]);

    const onMouseOver = (event: React.MouseEvent<HTMLDivElement>) => {
        setAnchorElement(event.currentTarget);
    };

    const onMouseLeave = () => {
        setAnchorElement(null);
    };

    const classes = popOverStyle();

    const handleOnHover = (task: string) => {
        setIsHovered(task === 'SELECT' ? true : false);
    };

    return (
        <NodeFieldContainer
            onMouseOver={() => handleOnHover('SELECT')}
            onMouseLeave={() => handleOnHover('UNSELECT')}
        >
            <GraphqlBasePortWidget
                port={node.getPort(`left-${path}`)}
                engine={engine}
            />
            <FieldName onMouseOver={onMouseOver} onMouseLeave={onMouseLeave} style={{ marginLeft: '7px' }}>
                {functionElement.identifier}
            </FieldName>
            <FieldType>{functionElement.returnType}</FieldType>
            {isHovered &&
                <ChildActionMenu
                    functionType={FunctionType.CLASS_RESOURCE}
                    location={node.classObject.position}
                    path={functionElement.identifier}
                />
            }
            <GraphqlBasePortWidget
                port={node.getPort(`right-${path}`)}
                engine={engine}
            />

            {functionElement.parameters?.length > 0 && (
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
                    <ParametersPopup parameters={functionElement.parameters}/>
                </Popover>
            )}
        </NodeFieldContainer>
    );
}
