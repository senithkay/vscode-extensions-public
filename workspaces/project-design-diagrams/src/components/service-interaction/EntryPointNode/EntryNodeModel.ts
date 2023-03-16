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

import { PortModelAlignment } from '@projectstorm/react-diagrams';
import { ServicePortModel } from '../ServicePort/ServicePortModel';
import { SharedNodeModel } from '../../common/shared-node/shared-node';
import { Level, Location } from '../../../resources';

export class EntryNodeModel extends SharedNodeModel {
    level: Level;
    elementLocation: Location;

    constructor(packageName: string, level: Level, location: Location) {
        super('entryPointNode', packageName);

        this.level = level;
        this.elementLocation = location;

        this.addPort(new ServicePortModel(packageName, PortModelAlignment.LEFT));
        this.addPort(new ServicePortModel(packageName, PortModelAlignment.RIGHT));
    }
}
