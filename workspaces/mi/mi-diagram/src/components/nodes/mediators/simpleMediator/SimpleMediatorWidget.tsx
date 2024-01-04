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
import { Codicon } from '@wso2-enterprise/ui-toolkit'
import SidePanelContext from '../../../sidePanel/SidePanelContexProvider';
import { getDataFromXML } from '../../../../utils/template-engine/mustach-templates/templateUtils';

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

export interface SimpleMediatorWidgetProps extends BaseNodeProps {
    name: string;
    description: string;
    documentUri: string;
    nodePosition: Range;
}

export function MediatorNodeWidget(props: SimpleMediatorWidgetProps) {
    const node: SimpleMediatorNodeModel = props.node as SimpleMediatorNodeModel;
    const sidePanelContext = React.useContext(SidePanelContext);

    const nodePosition = node.getPosition();
    const leftPort = node.getPortByAllignment('left');
    const rightPort = node.getPortByAllignment('right');
    const topPort = node.getPortByAllignment('top');
    const bottomPort = node.getPortByAllignment('bottom');
    leftPort.setPosition(nodePosition.x, nodePosition.y + node.height / 2);
    rightPort.setPosition(nodePosition.x + node.width, nodePosition.y + node.height / 2);
    topPort.setPosition(nodePosition.x + node.width / 2, nodePosition.y);
    bottomPort.setPosition(nodePosition.x + node.height / 2, nodePosition.y + node.height);
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseOver = () => {
        setIsHovered(true);
    };

    const handleMouseOut = () => {
        setIsHovered(false);
    };

    const editNode = async () => {
        sidePanelContext.setNodeRange(props.nodePosition);
        sidePanelContext.setMediator(props.name.toLowerCase());
        sidePanelContext.setIsOpen(true);
        const formData = getDataFromXML(
            props.name,
            props.node.getNode()
        );
        sidePanelContext.setFormValues(formData);
    }

    const deleteNode = async () => {
        MIWebViewAPI.getInstance().applyEdit({
            documentUri: props.documentUri, range: props.nodePosition, text: ""
        });
    }

    return (
        <div onMouseOver={handleMouseOver} onMouseOut={handleMouseOut} style={{ width: node.width, height: node.height }}>
            {getSVGIcon(props.name, props.description, node.width, node.height)}
            <ButtonComponent style={{ display: isHovered ? "flex" : "none" }}>
                <DeleteButton onClick={deleteNode}> <Codicon name="trash" /> </DeleteButton>
                <EditButton onClick={editNode}> <Codicon name="edit" /> </EditButton>
            </ButtonComponent>
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
                port={leftPort}
                engine={props.diagramEngine}
                node={props.node}
            />
        </div>
    );
}

