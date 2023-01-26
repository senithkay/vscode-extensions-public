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
import React, { useState } from 'react';

import { Popover } from "@material-ui/core";
import { DiagramEngine } from '@projectstorm/react-diagrams';

import { ParametersPopup } from "../../../Popup/ParametersPopup";
import { popOverStyle } from "../../../Popup/styles";
import { GraphqlBasePortWidget } from "../../../Port/GraphqlBasePortWidget";
import { MutationIcon } from '../../../resources/assets/icons/MutationIcon';
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

    const onMouseOver = (event: React.MouseEvent<HTMLDivElement>) => {
        setAnchorElement(event.currentTarget);
    }

    const onMouseLeave = () => {
        setAnchorElement(null);
    }

    const classes = popOverStyle();

    return (
        <>
            <GraphqlBasePortWidget
                port={node.getPort(`left-${remotePath}`)}
                engine={engine}
            />
            <MutationIcon/>
            <FieldName onMouseOver={onMouseOver} onMouseLeave={onMouseLeave} style={{marginLeft: '7px'}}>
                {remoteFunc.identifier}
            </FieldName>
            <FieldType>{remoteFunc.returns}</FieldType>
            <GraphqlBasePortWidget
                port={node.getPort(`right-${remotePath}`)}
                engine={engine}
            />
            {remoteFunc.parameters?.length > 0 && (
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
                    <ParametersPopup parameters={remoteFunc.parameters}/>
                </Popover>
            )}
        </>
    );
}
