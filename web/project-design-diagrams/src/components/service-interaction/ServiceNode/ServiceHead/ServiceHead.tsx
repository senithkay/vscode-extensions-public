/**
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

import React, { useEffect, useRef } from 'react';
import { DiagramEngine, PortModel } from '@projectstorm/react-diagrams';
import { ServicePortWidget } from '../../ServicePort/ServicePortWidget';
import { ServiceNodeModel } from '../ServiceNodeModel';
import { GrpcIcon, HttpServiceIcon } from '../../../../resources';
import { ServiceHead, ServiceName } from '../styles';

interface ServiceHeadProps {
    engine: DiagramEngine;
    node: ServiceNodeModel;
    isSelected: boolean;
}

export function ServiceHeadWidget(props: ServiceHeadProps) {
    const { engine, node, isSelected } = props;
    const headPorts = useRef<PortModel[]>([]);

    const displayName: string = node.serviceObject.annotation.label ? node.serviceObject.annotation.label : node.serviceObject.path ?
		node.serviceObject.path : node.serviceObject.serviceId;

    useEffect(() => {
        headPorts.current.push(node.getPortFromID('left-' + node.getID()));
        headPorts.current.push(node.getPortFromID('right-' + node.getID()));
    }, [node])

    const handleOnHover = (task: string) => {
        node.handleHover(headPorts.current, task);
    }

    return (
        <ServiceHead
            level={node.level}
            isSelected={isSelected}
            onMouseOver={() => { handleOnHover("SELECT") }}
            onMouseLeave={() => { handleOnHover("UNSELECT") }}
        >
            {node.isResourceService ?
                <HttpServiceIcon /> :
                <GrpcIcon fill={isSelected ? '#ffaf4d' : '#5567D5'} />
            }
            <ServicePortWidget
                port={node.getPort('left-' + node.getID())}
                engine={engine}
            />
                <ServiceName>{displayName}</ServiceName>
            <ServicePortWidget
                port={node.getPort('right-' + node.getID())}
                engine={engine}
            />
        </ServiceHead>
    )
}
