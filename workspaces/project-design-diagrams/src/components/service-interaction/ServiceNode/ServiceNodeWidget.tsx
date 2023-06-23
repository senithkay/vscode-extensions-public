/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useContext, useEffect, useRef, useState } from 'react';
import { DiagramEngine } from '@projectstorm/react-diagrams';
import { ServiceNodeModel } from './ServiceNodeModel';
import { ServiceLinkModel } from '../ServiceLink/ServiceLinkModel';
import { ServiceHeadWidget } from './ServiceHead/ServiceHead';
import { FunctionCard } from './FunctionCards/FunctionCard';
import { Level, ServiceTypes, Views } from '../../../resources';
import { DiagramContext } from '../../common';
import { ServiceNode } from './styles/styles';
import './styles/styles.css';

interface ServiceNodeWidgetProps {
	node: ServiceNodeModel;
	engine: DiagramEngine;
}

export function ServiceNodeWidget(props: ServiceNodeWidgetProps) {
	const { node, engine } = props;
	const {
		currentView,
		editingEnabled,
		newComponentID,
		setNewComponentID,
		newLinkNodes,
		setNewLinkNodes,
		editLayerAPI
	} = useContext(DiagramContext);
	const [selectedLinks, setSelectedLinks] = useState<ServiceLinkModel[]>([]);
	const { refreshDiagram } = useContext(DiagramContext)
	const isNewNode = useRef<boolean>(newComponentID === node.getID());

	useEffect(() => {
		if (editingEnabled && isNewNode.current) {
			setNewComponentID(undefined);
			setTimeout(() => {
				isNewNode.current = false;
			}, 4000)
		}
	}, [])

	useEffect(() => {
		node.registerListener({
			'SELECT': (event: any) => {
				setSelectedLinks(links => [...links, event.entity as ServiceLinkModel]);
			},
			'UNSELECT': () => { setSelectedLinks([]) }
		})
	}, [node])

	const checkLinkStatus = (): boolean => {
		return currentView === Views.L1_SERVICES && editingEnabled &&
			(newLinkNodes.source?.getID() === node.getID() || newLinkNodes.target?.getID() === node.getID());
	}

	const setLinkStatus = async () => {
		if (currentView === Views.L1_SERVICES &&
			editingEnabled &&
			newLinkNodes.source && newLinkNodes.source?.getID() !== node.getID() &&
			node.serviceType !== ServiceTypes.WEBHOOK && node.serviceType !== ServiceTypes.OTHER
		) {
			setNewLinkNodes({ ...newLinkNodes, target: node });
			await editLayerAPI?.addLink(newLinkNodes.source.nodeObject, node.nodeObject);
			setNewLinkNodes({ source: undefined, target: undefined });
			refreshDiagram();
		}
	}

	const nodeLevel: Level = node.nodeObject.isNoData ||
        (!node.nodeObject.remoteFunctions?.length && !node.nodeObject.resources?.length) ? Level.ONE : node.level;

	return (
		<ServiceNode
			className='fadeIn'
			onClick={setLinkStatus}
			awaitLinking={checkLinkStatus()}
			isNew={isNewNode.current}
			isSelected={node.checkSelectedList(selectedLinks, node.getID())}
			level={nodeLevel}
			isEditMode={editingEnabled}
			isNoData={node.nodeObject.isNoData}
		>
			<ServiceHeadWidget
				engine={engine}
				node={node}
				isSelected={node.checkSelectedList(selectedLinks, node.getID())}
			/>

			{node.level === Level.TWO &&
				node.nodeObject.resources.map((resource, index) => {
					return (
						<FunctionCard
							key={index}
							engine={engine}
							node={node}
							functionElement={resource}
							isSelected={node.checkSelectedList(selectedLinks, `${resource.resourceId.action}/${resource.identifier}`)}
						/>
					)
				})
			}
			{node.level === Level.TWO &&
				node.nodeObject.remoteFunctions.map((remoteFunc, index) => {
					return (
						<FunctionCard
							key={index}
							engine={engine}
							node={node}
							functionElement={remoteFunc}
							isSelected={node.checkSelectedList(selectedLinks, remoteFunc.name)}
						/>
					)
				})
			}
		</ServiceNode>
	);
}
