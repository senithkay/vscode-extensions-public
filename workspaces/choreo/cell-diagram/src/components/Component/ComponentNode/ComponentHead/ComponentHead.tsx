/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useRef, useState } from 'react';
import { DiagramEngine, PortModel } from '@projectstorm/react-diagrams';
import { ComponentPortWidget } from '../../ComponentPort/ComponentPortWidget';
import { ComponentModel } from '../ComponentModel';
import { ComponentHead, ComponentName } from '../styles';

interface ServiceHeadProps {
    engine: DiagramEngine;
    node: ComponentModel;
    isSelected: boolean;
    isCollapsed: boolean;
    onClick: () => void;
    setCollapsedStatus: (status: boolean) => void;
}

export function ComponentHeadWidget(props: ServiceHeadProps) {
    const { engine, node, isSelected, isCollapsed, onClick } = props;
    const headPorts = useRef<PortModel[]>([]);
    const [_isHovered, setIsHovered] = useState<boolean>(false);

    const displayName: string = node.componentObject.id || node.getID().slice(node.getID().lastIndexOf(':') + 1);

    useEffect(() => {
        headPorts.current.push(node.getPortFromID(`left-${node.getID()}`));
        headPorts.current.push(node.getPortFromID(`right-${node.getID()}`));
    }, [node])

    const handleOnHover = (task: string) => {
        setIsHovered(task === 'SELECT' ? true : false);
        if (!isCollapsed) {
            node.handleHover(headPorts.current, task);
        }
    }

    return (
        <ComponentHead
            isSelected={isSelected}
            onMouseOver={() => handleOnHover('SELECT')}
            onMouseLeave={() => handleOnHover('UNSELECT')}
            isCollapsed={isCollapsed}
        >
            <ComponentPortWidget
                port={node.getPort(`left-${node.getID()}`)}
                engine={engine}
            />
            <ComponentName
                onClick={onClick}
            >
                {displayName}
            </ComponentName>
            <ComponentPortWidget
                port={node.getPort(`right-${node.getID()}`)}
                engine={engine}
            />
        </ComponentHead>
    )
}
