/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content."
 */

import React, { useContext, useEffect, useState } from 'react';
import { CMRemoteFunction as RemoteFunction, CMResourceFunction as ResourceFunction } from '@wso2-enterprise/ballerina-languageclient';
import { DiagramEngine } from '@projectstorm/react-diagrams';
import Popover from '@mui/material/Popover';
import { DiagramContext } from '../../common';
import { ServiceLinkModel } from './ServiceLinkModel';
import { DataTypesPopup } from './data-types-popup/DataTypePopup';
import { findCallingFunction } from './link-utils';
import { ServiceLinkMenu } from './LinkMenuPanel/LinkMenuPanel';
import { Colors, Level } from '../../../resources';

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
	const [callingFunction, setCallingFunction] = useState<RemoteFunction | ResourceFunction>(undefined);

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
						link={link}
					/>
				</Popover>
			}

			{link.level === Level.ONE && editingEnabled && link.location && position &&
				<ServiceLinkMenu
					anchorElement={anchorElement}
					link={link}
					position={position}
					onMouseLeave={onMouseLeave}
					onMouseOver={onMouseOver}
				/>
			}
		</>
	)
}
