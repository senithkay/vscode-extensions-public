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

import React, { useContext, useEffect, useState } from 'react';
import { DiagramEngine } from '@projectstorm/react-diagrams';
import Popover from '@mui/material/Popover';
import { DiagramContext } from '../../common';
import { ServiceLinkModel } from './ServiceLinkModel';
import { DataTypesPopup } from './data-types-popup/DataTypePopup';
import { findCallingFunction } from './link-utils';
import { ServiceLinkMenu } from './LinkMenuPanel/LinkMenuPanel';
import { Colors, Level, RemoteFunction, ResourceFunction } from '../../../resources';

interface WidgetProps {
	engine: DiagramEngine,
	link: ServiceLinkModel
}

export function ServiceLinkWidget(props: WidgetProps) {
	const { link, engine } = props;
	const { editingEnabled } = useContext(DiagramContext);

	const [isSelected, setIsSelected] = useState<boolean>(false);
	const [position, setPosition] = useState({ x: undefined, y: undefined });
	const [anchorElement, setAnchorElement] = useState<SVGPathElement | HTMLDivElement>(null);
	const [callingFunction, setCallingFunction] = useState<ResourceFunction | RemoteFunction>(undefined);

	useEffect(() => {
		link.initLinks(engine);

		link.registerListener({
			'SELECT': selectPath,
			'UNSELECT': unselectPath
		})

		if (link.level === Level.TWO && link.getTargetPort().getNode().getType() === 'serviceNode') {
			setCallingFunction(findCallingFunction(link.getTargetPort()));
		}
	}, [link])

	const onMouseOver = (event: React.MouseEvent<SVGPathElement | HTMLDivElement>) => {
		setAnchorElement(event.currentTarget);
		selectPath();
	}

	const onMouseLeave = () => {
		setAnchorElement(null);
		unselectPath();
	}

	const selectPath = () => {
		link.selectLinkedNodes();
		setIsSelected(true);
	}

	const unselectPath = () => {
		link.resetLinkedNodes();
		setIsSelected(false);
	}

	return (
		<>
			<g>
				<polygon
					points={link.getArrowHeadPoints()}
					fill={isSelected ? Colors.PRIMARY_SELECTED : Colors.PRIMARY}
				/>

				<path
					id={link.getID()}
					cursor={'pointer'}
					d={link.getCurvePath()}
					fill='none'
					pointerEvents='all'
					onMouseLeave={onMouseLeave}
					onMouseMove={e => setPosition({ x: e.pageX, y: e.pageY })}
					onMouseOver={onMouseOver}
					stroke={isSelected ? Colors.PRIMARY_SELECTED : Colors.PRIMARY}
					strokeWidth={1}
				/>
			</g>

			{link.level === Level.TWO && callingFunction && position &&
				// Todo: Move to separate component
				<Popover
					id='mouse-over-popover'
					open={Boolean(anchorElement)}
					anchorPosition={{
						top: position.y,
						left: position.x
					}}
					anchorOrigin={{
						vertical: position.y,
						horizontal: position.x
					}}
					disableRestoreFocus
					onClose={onMouseLeave}
					PaperProps={{ onMouseLeave: onMouseLeave, onMouseOver: onMouseOver }}
					transformOrigin={{
						vertical: 'top',
						horizontal: 'center'
					}}
				>
					<DataTypesPopup
						callingFunction={callingFunction}
						location={link.location}
					/>
				</Popover>
			}

			{link.level === Level.ONE && editingEnabled && link.location && position &&
				<ServiceLinkMenu
					anchorElement={anchorElement}
					location={link.location}
					position={position}
					onMouseLeave={onMouseLeave}
					onMouseOver={onMouseOver}
				/>
			}
		</>
	)
}
