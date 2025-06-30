/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
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
 */
// tslint:disable: jsx-no-multiline-js
import * as React from 'react';

import { AbstractReactFactory } from '@projectstorm/react-canvas-core';
import { DiagramEngine } from '@projectstorm/react-diagrams-core';

import { InputOutputPortModel } from "../../Port";
import { FOCUSED_INPUT_SOURCE_PORT_PREFIX } from '../../utils/constants';
import { FocusedInputNode, FOCUSED_INPUT_NODE_TYPE } from './FocusedInputNode';
import { InputSearchNoResultFound, SearchNoResultFoundKind } from '../commons/Search';
import { InputNodeWidget } from '../Input/InputNodeWidget';

export class FocusedInputNodeFactory extends AbstractReactFactory<FocusedInputNode, DiagramEngine> {
    constructor() {
        super(FOCUSED_INPUT_NODE_TYPE);
    }

    generateReactWidget(event: { model: FocusedInputNode; }): JSX.Element {
        if (event.model.hasNoMatchingFields) {
            return (
                <InputSearchNoResultFound kind={SearchNoResultFoundKind.InputField} />
            );
        }
        return (
            <InputNodeWidget
                engine={this.engine}
                id={`${FOCUSED_INPUT_SOURCE_PORT_PREFIX}.${event.model.nodeLabel}`}
                dmType={event.model.dmType}
                getPort={(portId: string) => event.model.getPort(portId) as InputOutputPortModel}
                context={event.model.context}
                valueLabel={event.model.nodeLabel}
            />
        );
    }

    generateModel(): FocusedInputNode {
        return undefined;
    }
}
