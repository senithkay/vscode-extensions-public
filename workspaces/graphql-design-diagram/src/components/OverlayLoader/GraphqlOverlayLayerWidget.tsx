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
import { TextPreLoader } from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";

import { Container } from "../Canvas/CanvasWidgetContainer";

import { GraphqlOverlayLayerModel } from './GraphqlOverlayLayerModel';

export interface NodeLayerWidgetProps {
    layer: GraphqlOverlayLayerModel;
    engine: DiagramEngine;
}

export class GraphqlOverlayLayerWidget extends React.Component<NodeLayerWidgetProps> {
    render() {
        return (
            <Container className="dotted-background">
                <TextPreLoader position="absolute" text="Rendering the Diagram..." />
            </Container>
        );
    }
}
