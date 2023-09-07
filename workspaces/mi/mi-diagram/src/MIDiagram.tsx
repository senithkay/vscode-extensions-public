/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useState } from 'react';
import {
	DiagramModel,
	DagreEngine,
	DiagramEngine
} from '@projectstorm/react-diagrams';

import { CanvasContainer } from './Canvas';
import { createLinks, generateEngine } from './Utils';
import { MediatorNodeModel } from './components/node/MediatorNodeModel';
import { MediatorPortModel } from './components/port/MediatorPortModel';
import { NavigationWrapperCanvasWidget } from './components/DiagramNavigationWrapper/NavigationWrapperCanvasWidget';
import { MediatorLinkModel } from './components/link/MediatorLinkModel';

const dagreEngine = new DagreEngine({
	graph: {
		rankdir: 'LR',
		ranksep: 175,
		edgesep: 20,
		nodesep: 60,
		ranker: 'longest-path',
		marginx: 40,
		marginy: 40
	}
});

export interface MIDiagramProps {
	data?: string;
}

export function MIDiagram(_props: MIDiagramProps) {
	const [diagramEngine, setEngine] = useState<DiagramEngine>(undefined);
	const [model, setDiagramModel] = useState<DiagramModel>(new DiagramModel());

	useEffect(() => {
		const e = generateEngine();

		var node1 = new MediatorNodeModel({ name: 'Mahinda' });
		var node2 = new MediatorNodeModel({ name: ' Ranil' });
		let sourcePort: MediatorPortModel = node1.getPort(`right-${node1.getID()}`);
		let targetPort: MediatorPortModel = node2.getPort(`left-${node2.getID()}`);

		const linkId: string = `${sourcePort.getID()}::${targetPort.getID()}`;
		let link: MediatorLinkModel = new MediatorLinkModel(linkId);
		link = createLinks(sourcePort, targetPort, link);

		model.addAll(node1, node2, link);
		e.setModel(model);

		dagreEngine.redistribute(e.getModel());

		e.setModel(model);
		setDiagramModel(model);
		setEngine(e);
		autoDistribute();
	}, []);

	const autoDistribute = () => {
		setTimeout(() => {
			dagreEngine.redistribute(diagramEngine.getModel());
			diagramEngine.setModel(model);
		}, 30);
	};

	return (
		<>
			{diagramEngine && diagramEngine.getModel() &&
				<div>
					<CanvasContainer>
						<NavigationWrapperCanvasWidget
							diagramEngine={diagramEngine}
						/>
					</CanvasContainer>
				</div>
			}
		</>
	);
}
