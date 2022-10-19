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

import React, { useContext, useEffect, useRef } from 'react';
import { DiagramEngine, PortModel } from '@projectstorm/react-diagrams';
import { DiagramContext } from '../../../common';
import { EntityPortWidget } from '../../EntityPort/EntityPortWidget';
import { EntityModel } from '../EntityModel';
import { EntityHead } from '../styles';
import { Views } from '../../../../resources';

interface ServiceHeadProps {
    engine: DiagramEngine;
    node: EntityModel;
    isSelected: boolean;
}

export function EntityHeadWidget(props: ServiceHeadProps) {
    const { engine, node, isSelected } = props;

    const { getTypeComposition, currentView } = useContext(DiagramContext);
    const headPorts = useRef<PortModel[]>([]);

    const displayName: string = node.getID().slice(node.getID().lastIndexOf(':') + 1);

    useEffect(() => {
        headPorts.current.push(node.getPortFromID(`left-${node.getID()}`));
        headPorts.current.push(node.getPortFromID(`right-${node.getID()}`));
    }, [node])

    const handleOnHover = (task: string) => {
        node.handleHover(headPorts.current, task);
    }

    return (
        <EntityHead
            isClickable={currentView !== Views.TYPE_COMPOSITION}
            isSelected={isSelected}
            onClick={() => { getTypeComposition(node.getID()) }}
            onMouseOver={() => handleOnHover('SELECT')}
            onMouseLeave={() => handleOnHover('UNSELECT')}
        >
            <EntityPortWidget
                port={node.getPort(`left-${node.getID()}`)}
                engine={engine}
            />
                {displayName}
            <EntityPortWidget
                port={node.getPort(`right-${node.getID()}`)}
                engine={engine}
            />
        </EntityHead>
    )
}
