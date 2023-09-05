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
import { ConnectorModel } from '../ConnectorModel';
import { ConnectorHead } from '../styles';

interface ServiceHeadProps {
    engine: DiagramEngine;
    node: ConnectorModel;
    isSelected: boolean;
    isCollapsed: boolean;
    onClick: () => void;
    setCollapsedStatus: (status: boolean) => void;
}

export function ConnectorHeadWidget(props: ServiceHeadProps) {
    const { node, isSelected, isCollapsed } = props;
    const headPorts = useRef<PortModel[]>([]);
    const [_isHovered, setIsHovered] = useState<boolean>(false);

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
        <ConnectorHead
            isSelected={isSelected}
            onMouseOver={() => handleOnHover('SELECT')}
            onMouseLeave={() => handleOnHover('UNSELECT')}
            isCollapsed={isCollapsed}
        >
            {/* <ConnectorPortWidget
                port={node.getPort(`top-${node.getID()}`)}
                engine={engine}
            /> */}
        </ConnectorHead>
    )
}
