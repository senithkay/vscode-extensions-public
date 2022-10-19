import React, { useEffect, useRef, useState } from 'react';
import { DiagramEngine, PortModel } from '@projectstorm/react-diagrams';
import { EntityModel } from '../EntityModel';
import { EntityPortWidget } from '../../EntityPort/EntityPortWidget';
import { Attribute } from '../../../../resources';
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
                <AttributeName>{attribute.name}</AttributeName>
                <AttributeType isSelected={isSelected || isHovered}>{attributeType}</AttributeType>
            <EntityPortWidget
                port={node.getPort(`right-${node.getID()}/${attribute.name}`)}
                engine={engine}
            />
        </AttributeContainer>
    );
}
