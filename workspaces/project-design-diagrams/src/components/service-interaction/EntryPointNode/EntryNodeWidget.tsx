/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React, { useContext, useEffect, useRef, useState } from 'react';
import { DiagramEngine, PortModel } from '@projectstorm/react-diagrams';
import { ChoreoComponentType } from '@wso2-enterprise/choreo-core';
import { EntryNodeModel } from './EntryNodeModel';
import { Container, DisplayName } from './styles';
import { Colors, DefaultEntryPointIcon, Level, ManualTriggerIcon, ScheduledTriggerIcon, Views } from '../../../resources';
import { ServicePortWidget } from '../ServicePort/ServicePortWidget';
import { CtrlClickGo2Source, DiagramContext, NodeMenuWidget } from '../../common';

interface EntryNodeProps {
    engine: DiagramEngine;
    node: EntryNodeModel;
}

export function EntryNodeWidget(props: EntryNodeProps) {
    const { engine, node } = props;
    const { currentView, editingEnabled, newLinkNodes } = useContext(DiagramContext);

    const headPorts = useRef<PortModel[]>([]);
    const [isSelected, setIsSelected] = useState<boolean>(false);
    const [isHovered, setIsHovered] = useState<boolean>(false);

    useEffect(() => {
        node.registerListener({
            'SELECT': () => { setIsSelected(true) },
            'UNSELECT': () => { setIsSelected(false) }
        });
        headPorts.current.push(node.getPortFromID(`left-${node.getID()}`));
        headPorts.current.push(node.getPortFromID(`right-${node.getID()}`));
    }, [node])

    const checkLinkStatus = (): boolean => {
        return currentView === Views.L1_SERVICES && editingEnabled && newLinkNodes.source?.getID() === node.getID();
    }

    const handleOnHover = (task: string) => {
        node.handleHover(headPorts.current, task);
        setIsHovered(task === 'SELECT' ? true : false);
    }

    const processPackageName = (): string => {
        const packageNameWithVersion: string = node.getID().slice(node.getID().indexOf('/') + 1);
        return packageNameWithVersion.slice(0, packageNameWithVersion.lastIndexOf(':'));
    }

    const displayName: string = node.nodeObject.annotation?.label || processPackageName();

    return (
        <CtrlClickGo2Source location={node.nodeObject.elementLocation}>
            <Container
                isSelected={isSelected}
                level={node.level}
                awaitLinking={checkLinkStatus()}
                onMouseOver={() => { handleOnHover('SELECT') }}
                onMouseLeave={() => { handleOnHover('UNSELECT') }}
            >
                <ServicePortWidget
                    port={node.getPort(`left-${node.getID()}`)}
                    engine={engine}
                />
                {node.nodeObject.type &&
                    node.nodeObject.type === ChoreoComponentType.ScheduledTask ? <ScheduledTriggerIcon /> :
                    node.nodeObject.type === ChoreoComponentType.ManualTrigger ? <ManualTriggerIcon /> :
                        <DefaultEntryPointIcon />
                }
                <DisplayName>{displayName}</DisplayName>
                {isHovered && node.nodeObject.elementLocation && editingEnabled &&
                    <NodeMenuWidget
                        background={node.level === Level.ONE ? Colors.SECONDARY : 'white'}
                        location={node.nodeObject.elementLocation}
                        linkingEnabled={currentView === Views.L1_SERVICES}
                        node={node}
                    />
                }
                <ServicePortWidget
                    port={node.getPort(`right-${node.getID()}`)}
                    engine={engine}
                />
            </Container>
        </CtrlClickGo2Source>
    );
}
