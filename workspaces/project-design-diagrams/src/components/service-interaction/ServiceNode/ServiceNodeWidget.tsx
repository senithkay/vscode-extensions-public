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
		if (currentView === Views.L1_SERVICES && editingEnabled) {
			if (newLinkNodes.source?.serviceId === node.getID() || newLinkNodes.target?.serviceId === node.getID()) {
				return true;
			}
		}
		return false;
	}

	const setLinkStatus = async () => {
		if (currentView === Views.L1_SERVICES &&
			editingEnabled &&
			newLinkNodes.source &&
			newLinkNodes.source.serviceId !== node.getID() &&
			node.serviceType !== ServiceTypes.OTHER
		) {
			setNewLinkNodes({ ...newLinkNodes, target: node.serviceObject });
			await editLayerAPI?.addLink(newLinkNodes.source, node.serviceObject);
			setNewLinkNodes({ source: undefined, target: undefined });
			refreshDiagram();
		}
	}

	return (
		<ServiceNode
			className='fadeIn'
			onClick={setLinkStatus}
			awaitLinking={checkLinkStatus()}
			isNew={isNewNode.current}
			isSelected={node.checkSelectedList(selectedLinks, node.getID())}
			level={node.level}
			isEditMode={editingEnabled}
		>
			<ServiceHeadWidget
				engine={engine}
				node={node}
				isSelected={node.checkSelectedList(selectedLinks, node.getID())}
			/>

			{node.level === Level.TWO &&
				node.serviceObject.resources.map((resource, index) => {
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
				node.serviceObject.remoteFunctions.map((remoteFunc, index) => {
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
