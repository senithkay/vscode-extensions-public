/**
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
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
import { EntityLinkModel } from './EntityLinkModel';

interface WidgetProps {
	engine: DiagramEngine,
	link: EntityLinkModel
}

export function EntityLinkWidget(props: WidgetProps) {
	const { engine, link } = props;

	const [isSelected, setIsSelected] = useState<boolean>(false);

	useEffect(() => {
		link.initLinks(engine);

		link.registerListener({
			"SELECT": selectPath,
			"UNSELECT": unselectPath
		})
	}, [link])

	const selectPath = () => {
		setIsSelected(true);
		link.selectLinkedNodes();
	}

	const unselectPath = () => {
		setIsSelected(false);
		link.resetLinkedNodes();
	}

	return (
		<g>
			{link.cardinality ?
				<>
					<text {...link.getCardinalityProps(link.getSourcePort())}>
						{transformCardinality(link.cardinality.self)}
					</text>

					<text {...link.getCardinalityProps(link.getTargetPort())}>
						{transformCardinality(link.cardinality.associate)}
					</text>

					<path
						id={link.getID()}
						d={link.getCurvePath()}
						cursor={'pointer'}
						fill={'none'}
						onMouseLeave={unselectPath}
						onMouseOver={selectPath}
						pointerEvents='all'
						stroke={isSelected ? '#ffaf4d' : '#5567D5'}
						strokeWidth={0.75}
					/>
				</> :
				<>
					<polygon
						points={link.getArrowHeadPoints()}
						fill={isSelected ? '#ffaf4d' : '#5567D5'}
					/>
					<line
						id={link.getID()}
						x1={link.getSourcePort().getX()}
						y1={link.getSourcePort().getY()}
						x2={link.getTargetPort().getX()}
						y2={link.getTargetPort().getY() + 14}
						cursor={'pointer'}
						onMouseLeave={unselectPath}
						onMouseOver={selectPath}
						pointerEvents='all'
						stroke={isSelected ? '#ffaf4d' : '#5567D5'}
						strokeWidth={0.75}
					/>
				</>
			}
		</g>
	)
}

function transformCardinality(cardinality: string): string {
	cardinality = cardinality.replace('-', '..');
	cardinality = cardinality.replace('m', '*');
	return cardinality;
}
