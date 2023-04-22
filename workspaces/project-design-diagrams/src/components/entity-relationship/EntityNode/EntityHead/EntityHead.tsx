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
import { CtrlClickGo2Source, DiagramContext, NodeMenuWidget } from '../../../common';
import { EntityPortWidget } from '../../EntityPort/EntityPortWidget';
import { EntityModel } from '../EntityModel';
import { EntityHead, EntityName } from '../styles';
import { Views } from '../../../../resources';

interface ServiceHeadProps {
    engine: DiagramEngine;
    node: EntityModel;
    isSelected: boolean;
}

const ANON_RECORD_DISPLAY: string = 'record';

export function EntityHeadWidget(props: ServiceHeadProps) {
    const { engine, node, isSelected } = props;
    const { getTypeComposition, currentView, editingEnabled } = useContext(DiagramContext);
    const headPorts = useRef<PortModel[]>([]);
    const [isHovered, setIsHovered] = useState<boolean>(false);

    const displayName: string = node.getID().slice(node.getID().lastIndexOf(':') + 1);

    useEffect(() => {
        headPorts.current.push(node.getPortFromID(`left-${node.getID()}`));
        headPorts.current.push(node.getPortFromID(`right-${node.getID()}`));
    }, [node])

    const handleOnHover = (task: string) => {
        setIsHovered(task === 'SELECT' ? true : false);
        node.handleHover(headPorts.current, task);
    }

    const isClickable = currentView === Views.TYPE;

    return (
        <CtrlClickGo2Source location={node.entityObject.elementLocation}>
            <EntityHead
                isAnonymous={node.entityObject.isAnonymous}
                isSelected={isSelected}
                onMouseOver={() => handleOnHover('SELECT')}
                onMouseLeave={() => handleOnHover('UNSELECT')}
            >
                <EntityPortWidget
                    port={node.getPort(`left-${node.getID()}`)}
                    engine={engine}
                />
                    <EntityName
                        isClickable={isClickable}
                        isAnonymous={node.entityObject.isAnonymous}
                        onClick={isClickable ? () => { getTypeComposition(node.getID()) } : () => { }}
                    >
                        {node.entityObject.isAnonymous ? ANON_RECORD_DISPLAY : displayName}
                    </EntityName>
                    {isHovered && node.entityObject.elementLocation && editingEnabled &&
                        <NodeMenuWidget
                            background={'white'}
                            location={node.entityObject.elementLocation}
                        />
                    }
                <EntityPortWidget
                    port={node.getPort(`right-${node.getID()}`)}
                    engine={engine}
                />
            </EntityHead>
        </CtrlClickGo2Source>
    )
}
