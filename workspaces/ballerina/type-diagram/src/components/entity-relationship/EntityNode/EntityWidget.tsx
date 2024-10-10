/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useContext, useEffect, useState } from 'react';
import { DiagramEngine } from '@projectstorm/react-diagrams';

import { EntityModel } from './EntityModel';
import { EntityLinkModel } from '../EntityLink/EntityLinkModel';
import { EntityPortWidget } from '../EntityPort/EntityPortWidget';
import { EntityHeadWidget } from './EntityHead/EntityHead';
import { AttributeWidget } from './Attribute/AttributeCard';
import { EntityNode, InclusionPortsContainer } from './styles';
import { DiagramContext } from '../../common';

interface EntityWidgetProps {
    node: EntityModel;
    engine: DiagramEngine;
}

export function EntityWidget(props: EntityWidgetProps) {
    const { node, engine } = props;
    const { focusedNodeId, selectedNodeId } = useContext(DiagramContext);
    const [selectedLink, setSelectedLink] = useState<EntityLinkModel>(undefined);

    useEffect(() => {
        node.registerListener({
            'SELECT': (event: any) => {
                setSelectedLink(event.entity as EntityLinkModel);
            },
            'UNSELECT': () => { setSelectedLink(undefined) }
        })
    }, [node])

    return (
        <EntityNode
            isAnonymous={node.entityObject.isAnonymous}
            isEditMode={false}
            isSelected={node.isNodeSelected(selectedLink, node.getID()) || selectedNodeId === node.getID()}
            shouldShade={false}
            isFocused={node.getID() === focusedNodeId}
        >
            <EntityHeadWidget
                engine={engine}
                node={node}
                isSelected={node.isNodeSelected(selectedLink, node.getID()) || selectedNodeId === node.getID()}
            />

            {node.entityObject.attributes.map((attribute, index) => {
                return (
                    <AttributeWidget
                        key={index}
                        engine={engine}
                        node={node}
                        attribute={attribute}
                        isSelected={node.isNodeSelected(selectedLink, `${node.getID()}/${attribute.name}`)}
                    />
                )
            })}

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
