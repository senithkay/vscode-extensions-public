/**
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
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
import { CMEntity as Entity } from '@wso2-enterprise/ballerina-languageclient';
import { SharedNodeModel } from '../../common/shared-node/shared-node';
import { EntityPortModel } from '../EntityPort/EntityPortModel';

export class EntityModel extends SharedNodeModel {
    readonly entityObject: Entity;
    isRootEntity: boolean = false; // to provide a contrasting opacity in the composition diagram

    constructor(entityName: string, entityObject: Entity) {
        super('entityNode', entityName);
        this.entityObject = entityObject;

        this.addPort(new EntityPortModel(entityName, PortModelAlignment.LEFT));
        this.addPort(new EntityPortModel(entityName, PortModelAlignment.RIGHT));

        // dedicated ports to connect inheritance links (record inclusions)
        this.addPort(new EntityPortModel(entityName, PortModelAlignment.BOTTOM));
        this.addPort(new EntityPortModel(entityName, PortModelAlignment.TOP));

        this.entityObject.attributes.forEach(attribute => {
            this.addPort(new EntityPortModel(`${entityName}/${attribute.name}`, PortModelAlignment.LEFT));
            this.addPort(new EntityPortModel(`${entityName}/${attribute.name}`, PortModelAlignment.RIGHT));
        })
    }
}
