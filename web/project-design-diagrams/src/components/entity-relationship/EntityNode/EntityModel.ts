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

import { SharedNodeModel } from '../../common/shared-node/shared-node';
import { EntityPortModel } from '../EntityPort/EntityPortModel';
import { Entity } from '../../../resources';

export class EntityModel extends SharedNodeModel {
    readonly entityObject: Entity;
    isRootEntity: boolean = false;

    constructor(entityName: string, entityObject: Entity) {
        super('entityNode', entityName);
        this.entityObject = entityObject;

        this.addPort(new EntityPortModel(entityName, 'left'));
        this.addPort(new EntityPortModel(entityName, 'right'));
        this.addPort(new EntityPortModel(entityName, 'bottom'));
        this.addPort(new EntityPortModel(entityName, 'top'));

        this.entityObject.attributes.forEach(attribute => {
            this.addPort(new EntityPortModel(entityName + '/' + attribute.name, 'left'));
            this.addPort(new EntityPortModel(entityName + '/' + attribute.name, 'right'));
        })
    }
}
