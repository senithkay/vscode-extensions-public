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
import { ServicePortModel } from '../ServicePort/ServicePortModel';
import { Level, Service } from '../../../resources';
import { SharedNodeModel } from '../../common/shared-node/shared-node';

export class ServiceNodeModel extends SharedNodeModel{
	readonly level: Level;
	readonly serviceObject: Service;
	readonly isResourceService: boolean;

	constructor(serviceObject: Service, level: Level) {
		super( 'serviceNode', serviceObject.serviceId);

		this.level = level;
		this.serviceObject = serviceObject;
		this.isResourceService = this.serviceObject.remoteFunctions.length === 0;

		this.addPort(new ServicePortModel(this.serviceObject.serviceId, PortModelAlignment.LEFT));
		this.addPort(new ServicePortModel(this.serviceObject.serviceId, PortModelAlignment.RIGHT));

		if (level === Level.TWO) {
			if (this.isResourceService) {
				this.serviceObject.resources.forEach(resource => {
					this.addPort(new ServicePortModel(resource.resourceId.action + '/' + resource.identifier, PortModelAlignment.LEFT));
					this.addPort(new ServicePortModel(resource.resourceId.action + '/' + resource.identifier, PortModelAlignment.RIGHT));
				});
			} else {
				this.serviceObject.remoteFunctions.forEach(remoteFunc => {
					this.addPort(new ServicePortModel(remoteFunc.name, PortModelAlignment.LEFT));
					this.addPort(new ServicePortModel(remoteFunc.name, PortModelAlignment.RIGHT));
				})
			}
		}
	}
}
