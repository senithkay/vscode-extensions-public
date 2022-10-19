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
import { ServiceNodeModel } from './ServiceNodeModel';
import { ServiceLinkModel } from '../ServiceLink/ServiceLinkModel';
import { ServiceHeadWidget } from './ServiceHead/ServiceHead';
import { FunctionCard } from './FunctionCards/FunctionCard';
import { Level } from '../../../resources';
import { ServiceNode } from './styles';

interface ServiceNodeWidgetProps {
	node: ServiceNodeModel;
	engine: DiagramEngine;
}

export function ServiceNodeWidget(props: ServiceNodeWidgetProps) {
	const { node, engine } = props;
	const [selectedLinks, setSelectedLinks] = useState<ServiceLinkModel[]>([]);

	useEffect(() => {
		node.registerListener({
			"SELECT": (event: any) => {
				setSelectedLinks(links => [...links, event.entity as ServiceLinkModel]);
			},
			"UNSELECT": () => { setSelectedLinks([]) }
		})
	}, [node])

	return (
		<ServiceNode level={node.level} isSelected={node.checkSelectedList(selectedLinks, node.getID())}>
			<ServiceHeadWidget
				engine={engine}
				node={node}
				isSelected={node.checkSelectedList(selectedLinks, node.getID())}
			/>

			{node.level === Level.TWO && (
				node.isResourceService ?
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
					}) :
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
			)}
		</ServiceNode>
	);
}
