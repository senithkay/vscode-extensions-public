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

import React, { useContext, useEffect, useRef, useState } from 'react';
import { DiagramEngine, PortModel } from '@projectstorm/react-diagrams';
import MiscellaneousServicesIcon from '@mui/icons-material/MiscellaneousServices';
import { ServicePortWidget } from '../../ServicePort/ServicePortWidget';
import { ServiceNodeModel } from '../ServiceNodeModel';
import { CtrlClickGo2Source, DiagramContext, NodeMenuWidget } from '../../../common';
import { Colors, GraphQLIcon, GrpcIcon, HttpServiceIcon, Level, ServiceTypes, Views } from '../../../../resources';
import { ServiceHead, ServiceName } from '../styles/styles';

interface ServiceHeadProps {
    engine: DiagramEngine;
    node: ServiceNodeModel;
    isSelected: boolean;
}

export function ServiceHeadWidget(props: ServiceHeadProps) {
    const { engine, node, isSelected } = props;
    const { currentView, editingEnabled } = useContext(DiagramContext);
    const headPorts = useRef<PortModel[]>([]);
    const [isHovered, setIsHovered] = useState<boolean>(false);

    const displayName: string = node.serviceObject.annotation?.label || node.serviceObject.path || node.serviceObject.serviceId;

    useEffect(() => {
        headPorts.current.push(node.getPortFromID(`left-${node.getID()}`));
        headPorts.current.push(node.getPortFromID(`right-${node.getID()}`));
    }, [node])

    const handleOnHover = (task: string) => {
        setIsHovered(task === 'SELECT' ? true : false);
        node.handleHover(headPorts.current, task);
    }

    return (
        <CtrlClickGo2Source location={node.serviceObject.elementLocation}>
            <ServiceHead
                level={node.level}
                isSelected={isSelected}
                onMouseOver={() => { handleOnHover('SELECT') }}
                onMouseLeave={() => { handleOnHover('UNSELECT') }}
            >
                {node.serviceType === ServiceTypes.GRPC ?
                    <GrpcIcon /> :
                    node.serviceType === ServiceTypes.GRAPHQL ?
                        <GraphQLIcon /> :
                        node.serviceType === ServiceTypes.HTTP ?
                            <HttpServiceIcon /> :
                            <MiscellaneousServicesIcon fontSize='medium' />
                }
                <ServicePortWidget
                    port={node.getPort(`left-${node.getID()}`)}
                    engine={engine}
                />
                    <ServiceName>{displayName}</ServiceName>
                    {isHovered && node.serviceObject.elementLocation && editingEnabled &&
                        <NodeMenuWidget
                            background={node.level === Level.ONE ? Colors.SECONDARY : 'white'}
                            location={node.serviceObject.elementLocation}
                            linkingEnabled={currentView === Views.L1_SERVICES}
                            service={node.serviceObject}
                        />
                    }
                <ServicePortWidget
                    port={node.getPort(`right-${node.getID()}`)}
                    engine={engine}
                />
                {node.getPort(`top-${node.getID()}`) && (
                    <ServicePortWidget
                        port={node.getPort(`top-${node.getID()}`)}
                        engine={engine}
                    />
                )}
                {node.getPort(`left-gw-${node.getID()}`) && (
                    <ServicePortWidget
                        port={node.getPort(`left-gw-${node.getID()}`)}
                        engine={engine}
                    />
                )}
            </ServiceHead>
        </CtrlClickGo2Source>
    )
}
