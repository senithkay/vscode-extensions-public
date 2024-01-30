/* eslint-disable prefer-const */
/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { PortModelAlignment } from '@projectstorm/react-diagrams-core';
import { BaseNodeProps, SequenceType } from '../../../base/base-node/base-node';
import { AdvancedMediatorNodeModel } from './AdvancedMediatorModel';
import { MediatorPortWidget } from '../../../port/MediatorPortWidget';
import { drawSequence, setNodePositions } from '../../../../utils/Utils';
import { getSVGIcon } from '../Icons';
import styled from '@emotion/styled';
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';
import { Range } from '@wso2-enterprise/mi-syntax-tree/lib/src';
import { Codicon } from '@wso2-enterprise/ui-toolkit'
import SidePanelContext from '../../../sidePanel/SidePanelContexProvider';
import { MediatorLinkModel } from '../../../link/MediatorLinkModel';
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

export interface AdvancedMediatorWidgetProps extends BaseNodeProps {
    name: string;
    description: string;
    documentUri: string;
    nodePosition: Range;
}

export function MediatorNodeWidget(props: AdvancedMediatorWidgetProps) {
    const { rpcClient } = useVisualizerContext();

    const node: AdvancedMediatorNodeModel = props.node as AdvancedMediatorNodeModel;
    const subSequences = node.subSequences;
    const nodePosition = node.getPosition();
    const sidePanelContext = React.useContext(SidePanelContext);

    const leftPort = node.getPortByAllignment(PortModelAlignment.LEFT);
    const rightPort = node.getPortByAllignment(PortModelAlignment.RIGHT);
    const topPort = node.getPortByAllignment(PortModelAlignment.TOP);
    const bottomPort = node.getPortByAllignment(PortModelAlignment.BOTTOM);
    leftPort.setPosition(nodePosition.x, nodePosition.y + node.height / 2);
    rightPort.setPosition(nodePosition.x + node.width, nodePosition.y + node.height / 2);
    topPort.setPosition(nodePosition.x + node.width / 2, nodePosition.y);
    bottomPort.setPosition(nodePosition.x + node.width / 2, nodePosition.y + node.height);

    let [subSequencesWidth, setSubSequencesWidth] = useState(0);
    let [subSequencesHeight, setSubSequencesHeight] = useState(0);

    props.diagramEngine.getModel().getNodes().forEach(node => node.registerListener({
        eventDidFire: (event: any) => {
            if (event.function == "updateAdDimensions") {
                distribute();
            }
        }
    }));

    useEffect(() => {
        distribute();
        node.fireEvent({}, "updateAdDimensions");
    }, [node.width, node.height]);

    function distribute() {
        let subSequencesX = 0;
        subSequencesWidth = 0;
        subSequences.forEach((subSequence) => {
            let subSequenceHeight = 0;
            let subSequenceWidth = 40;
            const subNodes = subSequence.nodes;

            const nodesAndLinks = drawSequence(subNodes, SequenceType.SUB_SEQUENCE, subSequence.range, props.diagramEngine.getModel(), node.getNode());
            const nodes = nodesAndLinks.filter(nodeOrLink => !(nodeOrLink instanceof MediatorLinkModel));

            nodes.forEach((node) => {
                subSequenceHeight = Math.max(subSequenceHeight, node.height);
                subSequenceWidth = Math.max(subSequenceWidth, node.width);
            });

            subSequence.width = subSequenceWidth + 30;
            subSequencesWidth += subSequence.width;

            setNodePositions(nodes, nodePosition.x + subSequencesX + 25, node.getY() + 75, subSequence.width);
            subSequence.height = nodes.length > 0 ? (nodes[nodes.length - 1].getY() - nodes[0].getY()) + nodes[nodes.length - 1].height + OFFSET.BETWEEN.Y : 80;
            subSequencesX += subSequence.width + 35;
            subSequencesHeight = Math.max(subSequencesHeight, subSequence.height);
        });

        node.height = subSequencesHeight + 140;
        node.width = subSequencesWidth + 85;
        setSubSequencesHeight(subSequencesHeight);
        setSubSequencesWidth(subSequencesWidth);
    }

    const deleteNode = async () => {
        rpcClient.getMiDiagramRpcClient().applyEdit({
            documentUri: props.documentUri, range: props.nodePosition, text: ""
        });
        sidePanelContext.setFormValues(undefined);
        sidePanelContext.setNodeRange(undefined);
        sidePanelContext.setOperationName(undefined);
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

    const advancedNode = useMemo(() => {
        return <>
            <div style={{
                border: "1px",
                borderStyle: "solid",
                borderColor: "var(--vscode-panel-dropBorder)",
                width: props.node.width,
                height: props.node.height,
                position: 'relative',
                zIndex: 1
            }}>
                <ActionButtons />
                <div
                    style={{
                        width: "fit-content",
                        margin: "auto",
                        padding: "10px 10px 0 10px",
                        display: "flex",
                        gap: "10px",
                    }}
                >
                    {subSequences.map((subSequence) => {
                        return (
                            <div
                                style={{
                                    width: subSequence.width,
                                    height: subSequencesHeight,
                                    padding: "10px",
                                    marginBottom: "10px",
                                    border: "1px",
                                    borderStyle: "solid",
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
        </>;
    }, [subSequencesWidth, subSequencesHeight]);

    return (
        <>
            {advancedNode}
        </>
    );
}
