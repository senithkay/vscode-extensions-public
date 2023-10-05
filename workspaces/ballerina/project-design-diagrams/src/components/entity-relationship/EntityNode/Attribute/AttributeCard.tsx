/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useContext, useEffect, useRef, useState } from 'react';
import { DiagramEngine, PortModel } from '@projectstorm/react-diagrams';
import { CMAttribute as Attribute } from '@wso2-enterprise/ballerina-languageclient';
import { EntityModel } from '../EntityModel';
import { EntityPortWidget } from '../../EntityPort/EntityPortWidget';
import { CtrlClickGo2Source, DiagramContext, NodeMenuWidget } from '../../../common';
import { Colors, Views } from '../../../../resources';
import { extractAttributeType } from '../entity-util';
import { AttributeContainer, AttributeName, AttributeType } from '../styles';

interface AttributeProps {
    node: EntityModel;
    engine: DiagramEngine;
    attribute: Attribute;
    isSelected: boolean;
}

export function AttributeWidget(props: AttributeProps) {
    const { node, engine, attribute, isSelected } = props;
    const { editingEnabled, setFocusedNodeId, currentView } = useContext(DiagramContext);

    const [isHovered, setIsHovered] = useState<boolean>(false);
    const attributePorts = useRef<PortModel[]>([]);

    let attributeType: string = extractAttributeType(attribute.type);

    useEffect(() => {
        attributePorts.current.push(node.getPortFromID(`left-${node.getID()}/${attribute.name}`));
        attributePorts.current.push(node.getPortFromID(`right-${node.getID()}/${attribute.name}`));
    }, [attribute])

    const handleOnHover = (task: string) => {
        setIsHovered(task === 'SELECT' ? true : false);
        node.handleHover(attributePorts.current, task);
    }

    const onClickOnType = () => {
        if (currentView ===  Views.TYPE) {
            setFocusedNodeId(attribute?.associations[0]?.associate);
        }
    }

    return (
        <CtrlClickGo2Source location={attribute.sourceLocation}>
            <AttributeContainer
                isSelected={isSelected || isHovered}
                onMouseOver={() => handleOnHover('SELECT')}
                onMouseLeave={() => handleOnHover('UNSELECT')}
            >
                <EntityPortWidget
                    port={node.getPort(`left-${node.getID()}/${attribute.name}`)}
                    engine={engine}
                />
                    <AttributeName>{attribute.name}</AttributeName>
                    <AttributeType
                        isAnonymous={node.entityObject.isAnonymous}
                        isSelected={isSelected || isHovered}
                        onClick={onClickOnType}
                    >
                        {attributeType}
                    </AttributeType>
                    {isHovered && attribute.sourceLocation && editingEnabled &&
                        <NodeMenuWidget
                            background={Colors.SECONDARY}
                            location={attribute.sourceLocation}
                        />
                    }
                <EntityPortWidget
                    port={node.getPort(`right-${node.getID()}/${attribute.name}`)}
                    engine={engine}
                />
            </AttributeContainer>
        </CtrlClickGo2Source>
    );
}
