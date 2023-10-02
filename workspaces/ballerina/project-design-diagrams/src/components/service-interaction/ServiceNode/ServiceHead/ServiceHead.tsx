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
import MiscellaneousServicesIcon from '@mui/icons-material/MiscellaneousServices';
import PublicIcon from '@mui/icons-material/Public';
import Tooltip from '@mui/material/Tooltip';
import { WarningIcon } from '@wso2-enterprise/ballerina-low-code-edtior-commons';
import { ServicePortWidget } from '../../ServicePort/ServicePortWidget';
import { ServiceNodeModel } from '../ServiceNodeModel';
import { CtrlClickGo2Source, DiagramContext, NodeMenuWidget } from '../../../common';
import { UnSupportedMessage } from '../../../common/UnSupportedMessage/UnSupportedMessage';
import { Colors, GraphQLIcon, GrpcIcon, HttpServiceIcon, Level, ServiceTypes, Views, WebhookIcon } from '../../../../resources';
import { LoadingIconWrapper, ServiceHead, ServiceName } from '../styles/styles';
import { ResourceLoadingIcon } from "../../../../resources/assets/icons/ResourceLoadingIcon";


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
    const [showSupportTooltip, setShowSupportTooltip] = useState<boolean>(false);

    const displayName: string = node.nodeObject.label || node.nodeObject.annotation?.label || node.nodeObject.id;

    useEffect(() => {
        headPorts.current.push(node.getPortFromID(`left-${node.getID()}`));
        headPorts.current.push(node.getPortFromID(`right-${node.getID()}`));
    }, [node])

    const handleOnHover = (task: string) => {
        if (task === 'SELECT') {
            setIsHovered(true);
            setShowSupportTooltip(node.nodeObject.isNoData);
        } else {
            setIsHovered(false);
        }
        node.handleHover(headPorts.current, task);
    }

    const nodeLevel: Level = node.nodeObject.isNoData ||
        (!node.nodeObject.remoteFunctions?.length && !node.nodeObject.resourceFunctions?.length) ? Level.ONE : node.level;

    return (
        <CtrlClickGo2Source location={node.nodeObject.sourceLocation}>
            <Tooltip
                open={showSupportTooltip}
                onClose={() => setShowSupportTooltip(false)}
                arrow
                title={<UnSupportedMessage />}
                PopperProps={{
                    modifiers: [
                        {
                            name: 'offset',
                            options: { offset: [0, -5] }
                        }
                    ]
                }}
                componentsProps={{
                    tooltip: { sx: { backgroundColor: '#ffffff', borderRadius: '5px' } },
                    arrow: { sx: { color: '#ffffff' } }
                }}
            >
                <ServiceHead
                    level={nodeLevel}
                    isSelected={isSelected}
                    onMouseOver={() => { handleOnHover('SELECT') }}
                    onMouseLeave={() => { handleOnHover('UNSELECT') }}
                    dataInProgress={node.nodeObject.dataInProgress}
                    data-testid={`service-head-${node?.nodeObject?.label}`}
                >
                    {/*Render this Icon on console side when the data is being fetched*/}
                    {node.nodeObject.dataInProgress ?
                        (
                            <LoadingIconWrapper>
                                <ResourceLoadingIcon />
                            </LoadingIconWrapper>) :
                        (
                        node.nodeObject.isNoData ? (
                                <WarningIcon />
                            ) :
                            node.serviceType === ServiceTypes.GRPC ?
                                <GrpcIcon /> :
                                node.serviceType === ServiceTypes.GRAPHQL ?
                                    <GraphQLIcon /> :
                                    node.serviceType === ServiceTypes.HTTP ?
                                        <HttpServiceIcon /> :
                                        node.serviceType === ServiceTypes.WEBHOOK ?
                                            <WebhookIcon /> :
                                            node.serviceType === ServiceTypes.WEBAPP ?
                                                <PublicIcon /> :
                                                <MiscellaneousServicesIcon fontSize='medium' />
                    )}
                    <ServicePortWidget
                        port={node.getPort(`left-${node.getID()}`)}
                        engine={engine}
                    />
                    <ServiceName>{displayName}</ServiceName>
                    {isHovered && node.nodeObject.sourceLocation && editingEnabled &&
                        <NodeMenuWidget
                            background={nodeLevel === Level.ONE ? Colors.SECONDARY : 'white'}
                            location={node.nodeObject.sourceLocation}
                            linkingEnabled={currentView === Views.L1_SERVICES}
                            node={node}
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
            </Tooltip>
        </CtrlClickGo2Source>
    )
}
