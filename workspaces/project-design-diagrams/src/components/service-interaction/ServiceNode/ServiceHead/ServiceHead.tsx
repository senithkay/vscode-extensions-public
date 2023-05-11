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
import { WarningIcon } from '@wso2-enterprise/ballerina-low-code-edtior-commons';
import { ServicePortWidget } from '../../ServicePort/ServicePortWidget';
import { ServiceNodeModel } from '../ServiceNodeModel';
import { CtrlClickGo2Source, DiagramContext, NodeMenuWidget } from '../../../common';
import { Colors, GraphQLIcon, GrpcIcon, HttpServiceIcon, Level, ServiceTypes, Views } from '../../../../resources';
import { ServiceHead, ServiceName } from '../styles/styles';
import Popover from '@mui/material/Popover';
import { UnSupportedMessage } from "../../../common/UnSupportedMessage/UnSupportedMessage";

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
    const [anchorElement, setAnchorElement] = useState<SVGPathElement | HTMLDivElement>(null);

    const displayName: string = node.serviceObject.annotation?.label || node.serviceObject.path || node.serviceObject.serviceId;

    useEffect(() => {
        headPorts.current.push(node.getPortFromID(`left-${node.getID()}`));
        headPorts.current.push(node.getPortFromID(`right-${node.getID()}`));
    }, [node])

    const handleOnHover = (task: string, evt: React.MouseEvent<SVGPathElement | HTMLDivElement>) => {
        if (task === 'SELECT') {
            setIsHovered(true);
            setAnchorElement(evt.currentTarget);
        } else {
            setIsHovered(false);
            setAnchorElement(null);
        }
        node.handleHover(headPorts.current, task);
    }

    return (
        <CtrlClickGo2Source location={node.serviceObject.elementLocation}>
            <ServiceHead
                level={node.level}
                isSelected={isSelected}
                onMouseOver={(evt: React.MouseEvent<SVGPathElement | HTMLDivElement>) => { handleOnHover('SELECT', evt)}}
                onMouseLeave={(evt: React.MouseEvent<SVGPathElement | HTMLDivElement>) => { handleOnHover('UNSELECT', evt)}}
            >
                {
                    node.isNoData ? (
                        <WarningIcon/>
                    ) :
                        node.serviceType === ServiceTypes.GRPC ?
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
                            serviceNode={node}
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
                {node.isNoData && (
                    <Popover
                        id='mouse-over-popover'
                        open={!!anchorElement}
                        sx={{
                            pointerEvents: 'none',
                        }}
                        anchorEl={anchorElement}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'center',
                        }}
                        disableRestoreFocus
                        onClose={(evt: React.MouseEvent<SVGPathElement | HTMLDivElement>) => { handleOnHover('UNSELECT', evt)}}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'center',
                        }}
                        PaperProps={{
                            style: {
                                backgroundColor: "transparent",
                                boxShadow: "none",
                                borderRadius: 0
                            }
                        }}
                    >
                        <UnSupportedMessage />
                    </Popover>
                )}
            </ServiceHead>
        </CtrlClickGo2Source>
    )
}
