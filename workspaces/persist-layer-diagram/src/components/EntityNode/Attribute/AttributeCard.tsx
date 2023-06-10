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

import React, { useEffect, useRef, useState } from 'react';
import { DiagramEngine, PortModel } from '@projectstorm/react-diagrams';
import VpnKeyRoundedIcon from '@mui/icons-material/VpnKeyRounded';
import { CMAttribute as Attribute } from '@wso2-enterprise/ballerina-languageclient';
import { EntityModel } from '../EntityModel';
import { EntityPortWidget } from '../../EntityPort/EntityPortWidget';
import { extractAttributeType } from '../entity-util';
import { AttributeContainer, AttributeName, AttributeType, NullCheckContainer } from '../styles';

interface AttributeProps {
    node: EntityModel;
    engine: DiagramEngine;
    attribute: Attribute;
    isSelected: boolean;
}

export function AttributeWidget(props: AttributeProps) {
    const { node, engine, attribute, isSelected } = props;

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

    return (
        <AttributeContainer
            isSelected={isSelected || isHovered}
            onMouseOver={() => handleOnHover('SELECT')}
            onMouseLeave={() => handleOnHover('UNSELECT')}
        >
            <EntityPortWidget
                port={node.getPort(`left-${node.getID()}/${attribute.name}`)}
                engine={engine}
            />
            {attribute.isReadOnly && <VpnKeyRoundedIcon fontSize={'small'} sx={{ transform: 'rotate(-270deg) scaleY(-1)', left: '5px', position: 'absolute' }} />}
            <NullCheckContainer>
                {!attribute.nillable && <AttributeType style={{ marginRight: '8px' }} isNullCheck={true}>NOT NULL</AttributeType>}
            </NullCheckContainer>
            <AttributeName>{attribute.name}</AttributeName>
            <AttributeType
                isAnonymous={node.entityObject.isAnonymous}
                isSelected={isSelected || isHovered}
            >
                {attributeType}
            </AttributeType>
            <EntityPortWidget
                port={node.getPort(`right-${node.getID()}/${attribute.name}`)}
                engine={engine}
            />
        </AttributeContainer>
    );
}
