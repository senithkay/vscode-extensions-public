/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content."
 */

// tslint:disable: jsx-no-multiline-js
import React, { useContext, useState } from 'react';

import { Popover } from "@material-ui/core";
import { DiagramEngine } from '@projectstorm/react-diagrams';
import { GraphqlMutationIcon } from "@wso2-enterprise/ballerina-low-code-edtior-commons";

import { DiagramContext } from "../../../DiagramContext/GraphqlDiagramContext";
import { ParametersPopup } from "../../../Popup/ParametersPopup";
import { popOverStyle } from "../../../Popup/styles";
import { GraphqlBasePortWidget } from "../../../Port/GraphqlBasePortWidget";
import { RemoteFunction } from "../../../resources/model";
import { FieldName, FieldType } from "../../../resources/styles/styles";
import { GraphqlServiceNodeModel } from "../GraphqlServiceNodeModel";

interface RemoteFunctionProps {
    engine: DiagramEngine;
    node: GraphqlServiceNodeModel;
    remoteFunc: RemoteFunction;
    remotePath: string;
}

export function RemoteFunctionWidget(props: RemoteFunctionProps) {
    const { engine, node, remoteFunc, remotePath } = props;
    const [anchorElement, setAnchorElement] = useState<HTMLDivElement | null>(null);
    const { setSelectedNode } = useContext(DiagramContext);

    const onMouseOver = (event: React.MouseEvent<HTMLDivElement>) => {
        setAnchorElement(event.currentTarget);
    };

    const onMouseLeave = () => {
        setAnchorElement(null);
    };

    const updateSelectedNode = () => {
        setSelectedNode(remoteFunc.returns);
    }

    const classes = popOverStyle();

    return (
        <>
            <GraphqlBasePortWidget
                port={node.getPort(`left-${remotePath}`)}
                engine={engine}
            />
            <GraphqlMutationIcon />
            <FieldName onMouseOver={onMouseOver} onMouseLeave={onMouseLeave} style={{ marginLeft: '7px' }}>
                {remoteFunc.identifier}
            </FieldName>
            <div onClick={updateSelectedNode}>
                <FieldType>{remoteFunc.returns}</FieldType>
            </div>
            <GraphqlBasePortWidget
                port={node.getPort(`right-${remotePath}`)}
                engine={engine}
            />
            {remoteFunc.parameters?.length > 0 && (
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
                    <ParametersPopup parameters={remoteFunc.parameters} />
                </Popover>
            )}
        </>
    );
}
