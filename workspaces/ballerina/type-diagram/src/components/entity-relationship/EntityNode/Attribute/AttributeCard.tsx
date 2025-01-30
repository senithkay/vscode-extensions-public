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
import { Member, TypeFunctionModel } from '@wso2-enterprise/ballerina-core';
import { EntityModel } from '../EntityModel';
import { EntityPortWidget } from '../../EntityPort/EntityPortWidget';

import { AttributeContainer, AttributeName, AttributeType } from '../styles';
import { CtrlClickGo2Source, DiagramContext } from '../../../common';
import { extractAttributeType } from '../entity-utils';

interface AttributeProps {
    node: EntityModel;
    engine: DiagramEngine;
    attribute: Member | TypeFunctionModel;
    isSelected: boolean;
}

export function AttributeWidget(props: AttributeProps) {
    const { node, engine, attribute, isSelected } = props;
    const { setSelectedNodeId } = useContext(DiagramContext);

    const [isHovered, setIsHovered] = useState<boolean>(false);
    const attributePorts = useRef<PortModel[]>([]);

    // get the attribute type based on the attribute whether its Member or TypeFunctionModel
    const attType: string = 'returnType' in attribute ? attribute.returnType as string  : (attribute as Member).type as string;

    let attributeType: string = extractAttributeType(attType);// TODO: FIX for anynnymous records

    useEffect(() => {
        attributePorts.current.push(node.getPortFromID(`left-${node.getID()}/${attribute.name}`));
        attributePorts.current.push(node.getPortFromID(`right-${node.getID()}/${attribute.name}`));
    }, [attribute])

    const handleOnHover = (task: string) => {
        setIsHovered(task === 'SELECT' ? true : false);
        node.handleHover(attributePorts.current, task);
    }

    const onClickOnType = () => {
        if (attribute?.refs[0]) {
            setSelectedNodeId(attribute.refs[0]);
        }
    }

    return (
        <CtrlClickGo2Source node={node.entityObject}>
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
                    isAnonymous={false}
                    isSelected={isSelected || isHovered}
                    onClick={onClickOnType}
                >
                    {attributeType}
                </AttributeType>
                {/* {isHovered && attribute.sourceLocation && editingEnabled &&
                        <NodeMenuWidget
                            background={Colors.SECONDARY}
                            location={attribute.sourceLocation}
                        />
                    } */}
                <EntityPortWidget
                    port={node.getPort(`right-${node.getID()}/${attribute.name}`)}
                    engine={engine}
                />
            </AttributeContainer>
        </CtrlClickGo2Source>
    );
}
