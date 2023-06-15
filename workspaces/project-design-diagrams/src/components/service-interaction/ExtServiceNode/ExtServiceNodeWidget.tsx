/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content."
 */

import React, { useEffect, useState } from 'react';
import { DiagramEngine } from '@projectstorm/react-diagrams';
import { ExtServiceNodeModel } from './ExtServiceNodeModel';
import { ServicePortWidget } from '../ServicePort/ServicePortWidget';
import { EndpointIcon } from '../../../resources';
import { Container, IconContainer } from './styles';

interface ServiceNodeWidgetProps {
	node: ExtServiceNodeModel;
	engine: DiagramEngine;
}

export function ExtServiceNodeWidget(props: ServiceNodeWidgetProps) {
	const { node, engine } = props;
	const [isSelected, setIsSelected] = useState<boolean>(false);

	useEffect(() => {
		node.registerListener({
			'SELECT': () => { setIsSelected(true) },
			'UNSELECT': () => { setIsSelected(false) }
		})
	}, [node])

	return (
		<Container isSelected={isSelected}>
			{node.label} Endpoint
			<IconContainer isSelected={isSelected}>
				<ServicePortWidget
					port={node.getPort(`left-${node.getID()}`)}
					engine={engine}
				/>
					<EndpointIcon />
				<ServicePortWidget
					port={node.getPort(`right-${node.getID()}`)}
					engine={engine}
				/>
			</IconContainer>
		</Container>
	);
}
