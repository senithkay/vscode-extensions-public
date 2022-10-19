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

import React, { useEffect, useState } from 'react';
import { DiagramEngine } from '@projectstorm/react-diagrams';
import { ExtServiceNodeModel } from './ExtServiceNodeModel';
import { ServicePortWidget } from '../ServicePort/ServicePortWidget';
import { EndpointIcon, HttpServiceIcon, ShortGrpcIcon } from '../../../resources';
import { Container, IconContainer } from './styles';

interface ServiceNodeWidgetProps {
	node: ExtServiceNodeModel;
	engine: DiagramEngine;
}

export function ExtServiceNodeWidget(props: ServiceNodeWidgetProps) {
	const { node, engine } = props;
	const [isSelected, setIsSelected] = useState<boolean>(false);

	const displayName: string = node.getID().split('/')[1];

	useEffect(() => {
		node.registerListener({
			"SELECT": () => { setIsSelected(true) },
			"UNSELECT": () => { setIsSelected(false) }
		})
	}, [node])

	return (
		<Container isSelected={isSelected}>
			{displayName}
			<IconContainer isSelected={isSelected}>
				<ServicePortWidget
					port={node.getPort('left-' + node.getID())}
					engine={engine}
				/>
					{node.getID().includes('/grpc:') ?
						<ShortGrpcIcon /> :
						node.getID().includes('/http:') ?
							<HttpServiceIcon /> :
							<EndpointIcon fill={isSelected ? '#ffaf4d' : '#5567D5'} />
					}
				<ServicePortWidget
					port={node.getPort('right-' + node.getID())}
					engine={engine}
				/>
			</IconContainer>
		</Container>
	);
}
