/**
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

import React, { useContext, useEffect, useState } from 'react';
import { DiagramEngine } from '@projectstorm/react-diagrams';
import { EntityModel } from './EntityModel';
import { EntityLinkModel } from '../EntityLink/EntityLinkModel';
import { EntityPortWidget } from '../EntityPort/EntityPortWidget';
import { EntityHeadWidget } from './EntityHead/EntityHead';
import { AttributeWidget } from './Attribute/AttributeCard';
import { EntityNode, InclusionPortsContainer } from './styles';
import { DiagramContext } from '../DiagramContext/DiagramContext';

interface EntityWidgetProps {
    node: EntityModel;
    engine: DiagramEngine;
}

export function EntityWidget(props: EntityWidgetProps) {
    const { node, engine } = props;
    const { collapsedMode, selectedNodeId, setHasDiagnostics, setSelectedNodeId } = useContext(DiagramContext);
    const [selectedLink, setSelectedLink] = useState<EntityLinkModel>(undefined);
    const [isCollapsed, setCollapsibleStatus] = useState<boolean>(collapsedMode);

    useEffect(() => {
        node.registerListener({
            'SELECT': (event: any) => {
                setSelectedLink(event.entity as EntityLinkModel);
            },
            'UNSELECT': () => { setSelectedLink(undefined) }
        })
    }, [node]);

    useEffect(() => {
        setCollapsibleStatus(collapsedMode);
    }, [collapsedMode])

    useEffect(() => {
        engine.getModel().getLinks().forEach((link) => {
            const entityLink: EntityLinkModel = link as EntityLinkModel;
            if (entityLink.sourceNode?.nodeId === node.getID()) {
                if (isCollapsed && entityLink.getSourcePort().getID() !== `right-${node.getID()}`) {
                    link.setSourcePort(node.getPort(`right-${node.getID()}`));
                } else if (!isCollapsed &&
                    entityLink.getSourcePort().getID() !== `right-${node.getID()}/${entityLink.sourceNode.attributeId}`) {
                    link.setSourcePort(node.getPort(`right-${node.getID()}/${entityLink.sourceNode.attributeId}`));
                }
            } else if (entityLink.targetNode?.nodeId === node.getID()) {
                if (isCollapsed && entityLink.getTargetPort().getID() !== `left-${node.getID()}`) {
                    link.setTargetPort(node.getPort(`left-${node.getID()}`));
                } else if (!isCollapsed &&
                    entityLink.getTargetPort().getID() !== `right-${node.getID()}/${entityLink.targetNode?.attributeId}`) {
                    link.setTargetPort(node.getPort(`left-${node.getID()}/${entityLink.targetNode.attributeId}`));
                }
            }
        });
        engine.repaintCanvas();
    }, [isCollapsed]);

    if (node.entityObject.diagnostics.length) {
        setHasDiagnostics(true);
    }

    return (
        <EntityNode
            isAnonymous={node.entityObject.isAnonymous}
            isSelected={node.getID() === selectedNodeId || node.isNodeSelected(selectedLink, node.getID())}
        >
            <EntityHeadWidget
                engine={engine}
                node={node}
                isSelected={node.getID() === selectedNodeId || node.isNodeSelected(selectedLink, node.getID())}
                onClick={() => { setSelectedNodeId(node.getID()) }}
                isCollapsed={isCollapsed}
                setCollapsedStatus={setCollapsibleStatus}
            />

            {!isCollapsed && (
                node.entityObject.attributes.map((attribute, index) => {
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
            )}

            <InclusionPortsContainer>
                <EntityPortWidget
                    port={node.getPort(`top-${node.getID()}`)}
                    engine={engine}
                />
                <EntityPortWidget
                    port={node.getPort(`bottom-${node.getID()}`)}
                    engine={engine}
                />
            </InclusionPortsContainer>
        </EntityNode>
    );
}
