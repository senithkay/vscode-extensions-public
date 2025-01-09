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
import styled from '@emotion/styled';
import { Button, Icon, ThemeColors } from '@wso2-enterprise/ui-toolkit';

// import { Member } from '@wso2-enterprise/ballerina-core';

interface EntityWidgetProps {
    node: EntityModel;
    engine: DiagramEngine;
}

const EditIconContainer = styled.div`
    position: absolute;
    top: -20px;
    right: 7px;
    z-index: 1000;
    cursor: pointer;
    height: 14px;
    width: 14px;
`;

export function EntityWidget(props: EntityWidgetProps) {
    const { node, engine } = props;
    const { focusedNodeId, selectedNodeId, onEditNode } = useContext(DiagramContext);
    const [selectedLink, setSelectedLink] = useState<EntityLinkModel>(undefined);

    const renderAttributes = () => {
        const attributes: React.ReactNode[] = [];
        Object.entries(node.entityObject.members).forEach(([key, member]) => (
            attributes.push(
                <AttributeWidget
                    key={key}
                    engine={engine}
                    node={node}
                    attribute={member}
                    isSelected={node.isNodeSelected(selectedLink, `${node.getID()}/${member.name}`)}
                />
            )
        ));
        return attributes;
    };

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
            isAnonymous={false}
            isEditMode={false}
            isSelected={node.isNodeSelected(selectedLink, node.getID()) || selectedNodeId === node.getID()}
            shouldShade={false}
            isFocused={node.getID() === focusedNodeId}
        >
            {selectedNodeId === node.getID() && (
                <EditIconContainer>
                    <Button
                        appearance="icon"
                        tooltip="Edit">
                        <Icon name="editIcon" onClick={() => onEditNode(node.getID())} iconSx={{ color: ThemeColors.SECONDARY }} />
                    </Button>
                </EditIconContainer>
            )}
            <EntityHeadWidget
                engine={engine}
                node={node}
                isSelected={node.isNodeSelected(selectedLink, node.getID()) || selectedNodeId === node.getID()}
            />

            {renderAttributes()}

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
