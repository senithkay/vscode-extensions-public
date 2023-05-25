/**
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the 'License'); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * 'AS IS' BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
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
