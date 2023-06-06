/**
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com) All Rights Reserved.
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
 *
 */

import { DagreEngine } from '@projectstorm/react-diagrams-routing';

export enum Colors {
    DEFAULT_TEXT = '#40404B',
    DIAGRAM_BACKGROUND = '#FFF',
    PRIMARY = '#5567D5',
    PRIMARY_LIGHT = '#A6B3FF',
    PRIMARY_SELECTED = '#ffaf4d',
    SECONDARY = '#F0F1FB',
    SECONDARY_SELECTED = '#fffaf2',
    SHADED_SELECTED = '#faead2'
}

export const dagreEngine = new DagreEngine({
    graph: {
        rankdir: 'LR',
        ranksep: 175,
        edgesep: 20,
        nodesep: 20,
        ranker: 'longest-path',
        marginx: 40,
        marginy: 40
    }
});

export const NO_ENTITIES_DETECTED = 'Could not detect any entities in the Persist model.';
export const ERRONEOUS_MODEL = 'Please resolve the diagnostics to view the ER diagram.';
