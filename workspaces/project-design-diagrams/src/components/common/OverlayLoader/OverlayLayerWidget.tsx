/**
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the 'License'); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * 'AS IS' BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

import React from 'react';
import { DiagramEngine } from '@projectstorm/react-diagrams';
import CircularProgress from '@material-ui/core/CircularProgress';
import styled from '@emotion/styled';

import { OverlayLayerModel } from './OverlayLayerModel';
import { Colors } from '../../../resources';

export interface NodeLayerWidgetProps {
	layer: OverlayLayerModel;
	engine: DiagramEngine;
}

const background = require('../../../resources/assets/PatternBg.svg') as string;

const Container = styled.div`
	align-items: center;
	background-image: url(${background});
	display: flex;
	flex-direction: row;
	height: 100vh;
	justify-content: center;
	width: 100vw;
`;

export class OverlayLayerWidget extends React.Component<NodeLayerWidgetProps> {
	render() {
		return (
			<Container>
				<CircularProgress sx={{ color: Colors.PRIMARY }} />
			</Container>
		);
	}
}
