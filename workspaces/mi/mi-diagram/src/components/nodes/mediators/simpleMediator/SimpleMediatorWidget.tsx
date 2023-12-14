/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useState } from 'react';
import { BaseNodeProps } from '../../../base/base-node/base-node';
import { MediatorPortWidget } from '../../../port/MediatorPortWidget';
import { SimpleMediatorNodeModel } from './SimpleMediatorModel';
import { getSVGIcon } from '../Icons';
import { MIWebViewAPI } from '../../../../utils/WebViewRpc';
import { Range } from '@wso2-enterprise/mi-syntax-tree/lib/src';
import styled from '@emotion/styled';

const ButtonComponent = styled.div`
    flex-direction: row;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1000;
    gap: 5px;
    position: absolute;
`

const DeleteButton = styled.button`
    display: block;
    margin: 0 auto;
`

const EditButton = styled.button`
    display: block;
    margin: 0 auto;
    color: red;
`

export interface SimpleMediatorWidgetProps extends BaseNodeProps {
    name: string;
    description: string;
    documentUri: string;
    nodePosition: Range;
}

export function MediatorNodeWidget(props: SimpleMediatorWidgetProps) {
    const node: SimpleMediatorNodeModel = props.node as SimpleMediatorNodeModel;

    const nodePosition = node.getPosition();
    const leftPort = node.getPortByAllignment('left');
    const rightPort = node.getPortByAllignment('right');
    leftPort.setPosition(nodePosition.x, nodePosition.y + node.height / 2);
    rightPort.setPosition(nodePosition.x + node.width, nodePosition.y + node.height / 2);
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseOver = () => {
        setIsHovered(true);
    };

    const handleMouseOut = () => {
        setIsHovered(false);
    };

    const deleteNode = async () => {
        MIWebViewAPI.getInstance().applyEdit({
            documentUri: props.documentUri, range: props.nodePosition, text: ""
        });
    }

    return (
        <div onMouseOver={handleMouseOver} onMouseOut={handleMouseOut} style={{ width: node.width, height: node.height}}>
            {getSVGIcon(props.name, props.description, node.width, node.height)}
            <ButtonComponent style={{ display: isHovered ? "flex" : "none" }}>
                <DeleteButton onClick={deleteNode}> x </DeleteButton>
                <EditButton> e </EditButton>
            </ButtonComponent>
            <MediatorPortWidget
                port={leftPort}
                engine={props.diagramEngine}
                node={props.node}
            />
            <MediatorPortWidget
                port={rightPort}
                engine={props.diagramEngine}
                node={props.node}
            />
        </div>
    );
}

