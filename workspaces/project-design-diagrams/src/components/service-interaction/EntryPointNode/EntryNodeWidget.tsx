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

import React, { useEffect, useRef, useState } from 'react';
import { DiagramEngine, PortModel } from '@projectstorm/react-diagrams';
import { EntryNodeModel } from './EntryNodeModel';
import { Container, DisplayName } from './styles';
import { EntryPointIcon } from '../../../resources';

interface EntryNodeProps {
    engine: DiagramEngine;
    node: EntryNodeModel;
}

export function EntryNodeWidget(props: EntryNodeProps) {
    const { node } = props;
    const headPorts = useRef<PortModel[]>([]);
    const [isSelected, setIsSelected] = useState<boolean>(false);

    useEffect(() => {
		node.registerListener({
			'SELECT': () => { setIsSelected(true) },
			'UNSELECT': () => { setIsSelected(false) }
		});
        headPorts.current.push(node.getPortFromID(`left-${node.getID()}`));
        headPorts.current.push(node.getPortFromID(`right-${node.getID()}`));
	}, [node])

    const handleOnHover = (task: string) => {
        node.handleHover(headPorts.current, task);
    }

    const packageNameWithVersion: string = node.getID().slice(node.getID().lastIndexOf('/'));
    const displayName = packageNameWithVersion.slice(0, packageNameWithVersion.lastIndexOf(':'));

    return (
        <Container
            isSelected={isSelected}
            level={node.level}
            onMouseOver={() => { handleOnHover('SELECT') }}
            onMouseLeave={() => { handleOnHover('UNSELECT') }}
        >
            <EntryPointIcon />
            <DisplayName>{displayName}</DisplayName>
        </Container>
    );
}
