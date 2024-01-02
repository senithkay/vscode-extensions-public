/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useState } from 'react';
import { PortModelAlignment } from '@projectstorm/react-diagrams-core';
import { BaseNodeProps } from '../../../base/base-node/base-node';
import { AdvancedMediatorNodeModel } from './AdvancedMediatorModel';
import { MediatorPortWidget } from '../../../port/MediatorPortWidget';
import { createLinks, setNodePositions } from '../../../../utils/Utils';
import { PlusNodeModel } from '../../plusNode/PlusNodeModel';
import { getSVGIcon } from '../Icons';
import styled from '@emotion/styled';
import { MIWebViewAPI } from '../../../../utils/WebViewRpc';
import { Range } from '@wso2-enterprise/mi-syntax-tree/lib/src';
import { Codicon } from '@wso2-enterprise/ui-toolkit'

const ButtonComponent = styled.div`
    flex-direction: row;
    top: 50%;
    left: 47px;
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

export interface AdvancedMediatorWidgetProps extends BaseNodeProps {
    name: string;
    description: string;
    documentUri: string;
    nodePosition: Range;
}

export function MediatorNodeWidget(props: AdvancedMediatorWidgetProps) {
    const [isHovered, setIsHovered] = useState(false);
    const node: AdvancedMediatorNodeModel = props.node as AdvancedMediatorNodeModel;
    const subSequences = node.subSequences;
    const nodePosition = node.getPosition();

    const leftPort = node.getPortByAllignment(PortModelAlignment.LEFT);
    const rightPort = node.getPortByAllignment(PortModelAlignment.RIGHT);
    const topPort = node.getPortByAllignment(PortModelAlignment.TOP);
    const bottomPort = node.getPortByAllignment(PortModelAlignment.BOTTOM);

    let [subSequencesWidth, setSubSequencesWidth] = useState(70);

    let subSequencesHeight = 0;
    useEffect(() => {

        leftPort.setPosition(nodePosition.x, nodePosition.y + node.height / 2);
        rightPort.setPosition(nodePosition.x + node.width, nodePosition.y + node.height / 2);
        topPort.setPosition(nodePosition.x + node.width / 2, nodePosition.y);
        bottomPort.setPosition(nodePosition.x + node.height / 2, nodePosition.y + node.width);

        subSequences.forEach((subSequence) => {
            let subSequenceHeight = 0;
            const subNodes = subSequence.nodes;
            const subNodesAndLinks = [];

            if (subNodes.length > 1) {
                for (let i = 0; i < subNodes.length; i++) {
                    subSequenceHeight = Math.max(subSequenceHeight, subNodes[i].height);
                    for (let j = i + 1; j < subNodes.length; j++) {
                        if (subNodes[i].getParentNode() == subNodes[j].getParentNode()) {
                            const link = createLinks(subNodes[i], subNodes[j], subNodes[i].getParentNode());
                            props.diagramEngine.getModel().addAll(subNodes[i], ...link, subNodes[j]);
                            subNodesAndLinks.push(subNodes[i], ...link.filter((plusNode) => plusNode instanceof PlusNodeModel), subNodes[j]);
                            break;
                        }
                    }
                }
            } else if (subNodes.length == 1) {
                subSequenceHeight = subNodes[0].height;
                props.diagramEngine.getModel().addNode(subNodes[0]);
                subNodesAndLinks.push(subNodes[0]);
            }

            setNodePositions(subNodesAndLinks, false, nodePosition.x + 20, nodePosition.y + subSequencesHeight + 30, subSequenceHeight + 25);
            subSequence.width = subNodes.length > 0 ? (subNodes[subNodes.length - 1].getX() - subNodes[0].getX()) + subNodes[subNodes.length - 1].width + 75 : 0;
            subSequence.height = subSequenceHeight + 25;
            subSequencesWidth = Math.max(subSequencesWidth, subSequence.width);
            subSequencesHeight += subSequence.height + 30;
        });

        node.height = subSequencesHeight + 20;
        node.width = subSequencesWidth + 132;
        setSubSequencesWidth(subSequencesWidth);
    }, [node.height, node.width, subSequencesHeight, subSequencesWidth]);

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

    node.fireEvent({}, "updateDimensions");
    
    return (
        <>
            <div style={{
                display: "flex",
                border: "1px",
                borderStyle: "solid",
                borderColor: "var(--vscode-panel-dropBorder)",
                height: props.node.height - 2,
                width: props.node.width,
                position: 'relative',
                zIndex: 1
            }}>
                <div style={{
                    padding: "10px",
                    alignItems: "center",
                    display: "flex",
                    width: 70,
                    height: node.height
                    }}
                    onMouseOver={handleMouseOver}
                    onMouseOut={handleMouseOut}
                >
                    {getSVGIcon(props.name, props.description, 70, node.height)}
                    <ButtonComponent style={{ display: isHovered ? "flex" : "none" }}>
                        <DeleteButton onClick={deleteNode}> <Codicon name="trash" /> </DeleteButton>
                        <EditButton> <Codicon name="edit" /> </EditButton>
                    </ButtonComponent>
                </div>
                <div
                    style={{
                        width: "fit-content",
                        padding: "10px 10px 0 10px",
                        borderWidth: "0 0 0 1px",
                        borderStyle: "solid",
                        borderColor: "var(--vscode-panel-dropBorder)",
                        // display: "grid",
                        // alignItems: "center",
                    }}
                >
                    {subSequences.map((subSequence) => {
                        return (
                            <div
                                style={{
                                    width: subSequencesWidth,
                                    height: subSequence.height,
                                    padding: "10px",
                                    marginBottom: "10px",
                                    border: "1px",
                                    borderStyle: "solid",
                                    borderColor: "var(--vscode-panel-dropBorder)",
                                    textAlign: "center",
                                }}
                            >
                                <span>{subSequence.name}</span>

                            </div>
                        );
                    },
                    )}
                </div>
            </div>
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
        </>
    );
}
