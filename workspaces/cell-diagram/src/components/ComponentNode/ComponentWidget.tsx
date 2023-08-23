/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useContext, useEffect, useState } from 'react';
import { DiagramEngine } from '@projectstorm/react-diagrams';
import { ComponentModel } from './ComponentModel';
import { ComponentLinkModel } from '../ComponentLink/ComponentLinkModel';
import { ComponentPortWidget } from '../ComponentPort/ComponentPortWidget';
import { ComponentHeadWidget } from './ComponentHead/ComponentHead';
import { AttributeWidget } from './Attribute/AttributeCard';
import { ComponentNode, InclusionPortsContainer } from './styles';
import { DiagramContext } from '../DiagramContext/DiagramContext';

interface ComponentWidgetProps {
    node: ComponentModel;
    engine: DiagramEngine;
}

export function ComponentWidget(props: ComponentWidgetProps) {
    const { node, engine } = props;
    const { collapsedMode, selectedNodeId, setHasDiagnostics, setSelectedNodeId, focusedNodeId, setFocusedNodeId } = useContext(DiagramContext);
    const [selectedLink, setSelectedLink] = useState<ComponentLinkModel>(undefined);
    const [isCollapsed, setCollapsibleStatus] = useState<boolean>(collapsedMode);

    useEffect(() => {
        node.registerListener({
            'SELECT': (event: any) => {
                setSelectedLink(event.component as ComponentLinkModel);
            },
            'UNSELECT': () => { setSelectedLink(undefined) }
        })
    }, [node]);

    useEffect(() => {
        setCollapsibleStatus(collapsedMode);
    }, [collapsedMode])

    // useEffect(() => {
    //     engine.getModel().getLinks().forEach((link) => {
    //         const componentLink: ComponentLinkModel = link as ComponentLinkModel;
    //         if (componentLink.sourceNode?.nodeId === node.getID()) {
    //             const attributeId: string = `${node.getID()}/${componentLink.sourceNode.attributeId}`;
    //             if (isCollapsed && componentLink.getSourcePort().getID() !== `right-${node.getID()}`) {
    //                 link.setSourcePort(node.getPort(`right-${node.getID()}`));
    //             } else if (!isCollapsed &&
    //                 node.getPort(`right-${attributeId}`) &&
    //                 componentLink.getSourcePort().getID() !== `right-${attributeId}`
    //             ) {
    //                 link.setSourcePort(node.getPort(`right-${attributeId}`));
    //             }
    //         } else if (componentLink.targetNode?.nodeId === node.getID()) {
    //             const attributeId: string = `${node.getID()}/${componentLink.targetNode.attributeId}`;
    //             if (isCollapsed && componentLink.getTargetPort().getID() !== `left-${node.getID()}`) {
    //                 link.setTargetPort(node.getPort(`left-${node.getID()}`));
    //             } else if (!isCollapsed &&
    //                 node.getPort(`left-${attributeId}`) &&
    //                 componentLink.getTargetPort().getID() !== `left-${attributeId}`
    //             ) {
    //                 link.setTargetPort(node.getPort(`left-${node.getID()}/${componentLink.targetNode.attributeId}`));
    //             }
    //         }
    //     });
    //     engine.repaintCanvas();
    // }, [isCollapsed]);

    // if (node.componentObject.diagnostics.length) {
    //     setHasDiagnostics(true);
    // }

    const handleOnHeaderWidgetClick = () => {
        setSelectedNodeId(node.getID());
        setFocusedNodeId(undefined);
    }

    return (
        <ComponentNode
            isSelected={node.getID() === selectedNodeId || node.isNodeSelected(selectedLink, node.getID())}
            isFocused={node.getID() === focusedNodeId}
        >
            <ComponentHeadWidget
                engine={engine}
                node={node}
                isSelected={node.getID() === selectedNodeId || node.isNodeSelected(selectedLink, node.getID())}
                onClick={handleOnHeaderWidgetClick}
                isCollapsed={isCollapsed}
                setCollapsedStatus={setCollapsibleStatus}
            />

            {/* {!isCollapsed && (
                node.componentObject.attributes.map((attribute, index) => {
                    return (
                        <AttributeWidget
                            key={index}
                            engine={engine}
                            node={node}
                            attribute={attribute}
                            isSelected={node.isNodeSelected(selectedLink, `${node.getID()}/${attribute.name}`)}
                        />
                    )
                })
            )} */}

        </ComponentNode>
    );
}
