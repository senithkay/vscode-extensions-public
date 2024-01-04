/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useState } from 'react';
import { BaseNodeProps } from '../../../base/base-node/base-node';
import { SimpleEndpointNodeModel } from './SimpleEndpointModel';
import { MediatorPortWidget } from '../../../port/MediatorPortWidget';
import { getSVGIcon } from '../Icons';
import styled from '@emotion/styled';
import { MIWebViewAPI } from '../../../../utils/WebViewRpc';
import { Range } from '@wso2-enterprise/mi-syntax-tree/lib/src';
import { createLinks, setNodePositions } from '../../../../utils/Utils';
import { PlusNodeModel } from '../../plusNode/PlusNodeModel';
import { Codicon } from '@wso2-enterprise/ui-toolkit';
import { OFFSET } from '../../../../constants';

const ButtonComponent = styled.div`
    top: 45px;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1000;
    gap: 5px;
    position: absolute;
`

const DeleteButton = styled.button`
    height: 23px;
    width: 23px;
    display: block;
    margin: 0 auto;
    color: red;
    padding: 2px;
`

const EditButton = styled.button`
    height: 23px;
    width: 23px;
    display: block;
    margin: 0 auto;
    padding: 2px;
`

export interface SimpleEndpointWidgetProps extends BaseNodeProps {
    name: string;
    description: string;
    documentUri: string;
    nodePosition: Range;
}

export function EndpointNodeWidget(props: SimpleEndpointWidgetProps) {
    const node: SimpleEndpointNodeModel = props.node as SimpleEndpointNodeModel;

    const subSequences = node.subSequences;
    const nodePosition = node.getPosition();
    const leftPort = node.getPortByAllignment('left');
    const rightPort = node.getPortByAllignment('right');
    const topPort = node.getPortByAllignment('top');
    const bottomPort = node.getPortByAllignment('bottom');
    leftPort.setPosition(nodePosition.x, nodePosition.y + node.height / 2);
    rightPort.setPosition(nodePosition.x + node.width, nodePosition.y + node.height / 2);
    topPort.setPosition(nodePosition.x + node.width / 2, nodePosition.y);
    bottomPort.setPosition(nodePosition.x + node.width / 2, nodePosition.y + node.height);
    
    useEffect(() => {
            const subNodes = subSequences[0].nodes;
            const subNodesAndLinks = [];

            if (subNodes.length == 1) {
                props.diagramEngine.getModel().addNode(subNodes[0]);
                subNodesAndLinks.push(subNodes[0]);

                const link = createLinks(node, subNodes[0], subNodes[0].getParentNode(), false, true, true);
                props.diagramEngine.getModel().addAll(node, ...link, subNodes[0]);
                subNodesAndLinks.push(...link.filter((plusNode) => plusNode instanceof PlusNodeModel));
            }

            setNodePositions(subNodesAndLinks, rightPort.getX() + 500, (nodePosition.y + node.height / 2) - (subNodes[0].height/2) - OFFSET.BETWEEN.Y, 25);
    }, [nodePosition]);

    const deleteNode = async () => {
        MIWebViewAPI.getInstance().applyEdit({
            documentUri: props.documentUri, range: props.nodePosition, text: ""
        });
    }

    const ActionButtons = () => {
    const [isHovered, setIsHovered] = useState(false);
    const handleMouseOver = () => {
            setIsHovered(true);
        };

        const handleMouseOut = () => {
            setIsHovered(false);
        };

        return (<div style={{
            padding: "10px",
            alignItems: "center",
            margin: "auto",
            width: 70,
            height: 70
        }}
            onMouseOver={handleMouseOver}
            onMouseOut={handleMouseOut}
        >
            {getSVGIcon(props.name, props.description, 70, 70)}
            <ButtonComponent style={{ display: isHovered ? "flex" : "none" }}>
                <DeleteButton onClick={deleteNode}> <Codicon name="trash" /> </DeleteButton>
                <EditButton> <Codicon name="edit" /> </EditButton>
            </ButtonComponent>
        </div>);
    }

    return (
        <div style={{ width: node.width, height: node.height }}>
            <ActionButtons />
            <MediatorPortWidget
                port={topPort}
                engine={props.diagramEngine}
                node={props.node}
            />
            <MediatorPortWidget
                port={bottomPort}
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
