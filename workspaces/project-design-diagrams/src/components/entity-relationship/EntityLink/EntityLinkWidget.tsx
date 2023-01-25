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

import React, { SVGProps, useEffect, useState } from 'react';
import { DiagramEngine, PortModel, PortModelAlignment } from '@projectstorm/react-diagrams';
import { Point } from '@projectstorm/geometry';
import { EntityLinkModel } from './EntityLinkModel';
import { Colors } from '../../../resources';

interface WidgetProps {
	engine: DiagramEngine,
	link: EntityLinkModel
}

export function EntityLinkWidget(props: WidgetProps) {
	const { engine, link } = props;

	const [isSelected, setIsSelected] = useState<boolean>(false);

	useEffect(() => {
		if (link.cardinality) {
			link.initLinks(engine);
		}

		link.registerListener({
			'SELECT': selectPath,
			'UNSELECT': unselectPath
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

	const multiLinkedTarget: boolean = Object.entries(link.getTargetPort().getLinks()).length > 1;

	const getCardinalityProps = (port: PortModel): SVGProps<SVGTextElement> => {
		let position: Point = port.getPosition();
		let props: SVGProps<SVGTextElement> = {
			fontFamily: isSelected ? 'GilmerBold' : 'GilmerRegular',
			fontSize: 11,
			fontWeight: isSelected ? 'bold' : 'normal',
			textAnchor: 'start',
			y: position.y - 5
		};

		if (port.getOptions().alignment === PortModelAlignment.LEFT) {
			return { ...props, x: position.x - 20 };
		} else {
			return { ...props, x: position.x + 18 };
		}
	}

	return (
		<g>
			{link.cardinality ?
				<>
					<text {...getCardinalityProps(link.getSourcePort())}>
						{transformCardinality(link.cardinality.self)}
					</text>

					<text {...getCardinalityProps(link.getTargetPort())}>
						{isSelected || !multiLinkedTarget ? transformCardinality(link.cardinality.associate) : '...'}
					</text>
				</> :
				<polygon
					points={link.getArrowHeadPoints()}
					fill={isSelected ? Colors.PRIMARY_SELECTED : Colors.PRIMARY}
				/>
			}
			<path
				id={link.getID()}
				d={link.getCurvePath()}
				cursor={'pointer'}
				fill={'none'}
				onMouseLeave={unselectPath}
				onMouseOver={selectPath}
				pointerEvents={'all'}
				stroke={isSelected ? Colors.PRIMARY_SELECTED : Colors.PRIMARY}
				strokeWidth={0.75}
			/>
		</g>
	)
}

function transformCardinality(cardinality: string): string {
	cardinality = cardinality.replace('-', '..');
	cardinality = cardinality.replace('m', '*');
	return cardinality;
}
