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
            if (link.getID().includes(node.getID())) {
                if (isCollapsed) {
                    if (link.getID().split('::')[0].includes(node.getID())) {
                        link.setSourcePort(node.getPort(link.getID().split('::')[0]));
                        node.getPort(link.getID().split('::')[0])?.addLink(link);
                    } else {
                        link.setTargetPort(node.getPort(link.getID().split('::')[1]));
                    }
                } else {
                    if (link.getID().split('::')[0].includes(node.getID())) {
                        link.setSourcePort(node.getPort(`right-${node.getID()}`));
                        node.getPort(`right-${node.getID()}`)?.addLink(link);
                    } else {
                        link.setTargetPort(node.getPort(`left-${node.getID()}`));
                    }
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

            {isCollapsed && (
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
