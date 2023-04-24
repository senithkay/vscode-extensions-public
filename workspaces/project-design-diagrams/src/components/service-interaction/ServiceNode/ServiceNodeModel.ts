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

import { CMService as Service } from '@wso2-enterprise/ballerina-languageclient';
import { PortModelAlignment } from '@projectstorm/react-diagrams';
import { ServicePortModel } from '../ServicePort/ServicePortModel';
import { Level, ServiceTypes } from '../../../resources';
import { SharedNodeModel } from '../../common/shared-node/shared-node';
import { GatewayType } from "../../gateway/types";

export class ServiceNodeModel extends SharedNodeModel {
	isLinked: boolean;
	readonly level: Level;
	readonly serviceObject: Service;
	readonly serviceType: ServiceTypes;
	readonly targetGateways: GatewayType[];

	constructor(serviceObject: Service, level: Level, targetGateways?: GatewayType[]) {
		super('serviceNode', serviceObject.serviceId);

		this.level = level;
		this.serviceObject = serviceObject;
		this.serviceType = this.getServiceType();
		this.targetGateways = targetGateways;

		this.addPort(new ServicePortModel(this.serviceObject.serviceId, PortModelAlignment.LEFT));
		this.addPort(new ServicePortModel(this.serviceObject.serviceId, PortModelAlignment.RIGHT));

		if (targetGateways) {
			this.addPort(new ServicePortModel(this.serviceObject.serviceId, PortModelAlignment.TOP));
			this.addPort(new ServicePortModel(this.serviceObject.serviceId, PortModelAlignment.LEFT, true));
		}

		if (level === Level.TWO) {
			this.serviceObject.resources.forEach(resource => {
				this.addPort(new ServicePortModel(`${resource.resourceId.action}/${resource.identifier}`, PortModelAlignment.LEFT));
				this.addPort(new ServicePortModel(`${resource.resourceId.action}/${resource.identifier}`, PortModelAlignment.RIGHT));
			});
			this.serviceObject.remoteFunctions.forEach(remoteFunc => {
				this.addPort(new ServicePortModel(remoteFunc.name, PortModelAlignment.LEFT));
				this.addPort(new ServicePortModel(remoteFunc.name, PortModelAlignment.RIGHT));
			})
		}
	}

	getServiceType = (): ServiceTypes => {
		if (this.serviceObject.serviceType) {
			if (this.serviceObject.serviceType.includes('ballerina/grpc:')) {
				return ServiceTypes.GRPC;
			} else if (this.serviceObject.serviceType.includes('ballerina/http:')) {
				return ServiceTypes.HTTP;
			} else if (this.serviceObject.serviceType.includes('ballerina/graphql:')) {
				return ServiceTypes.GRAPHQL;
			} else if (this.serviceObject.serviceType.includes('ballerina/websocket:')) {
				return ServiceTypes.WEBSOCKET
			}
		}
		return ServiceTypes.OTHER;
	}

	getTargetGateways = (): GatewayType[] => {
		return this.targetGateways;
	}

	setIsLinked = (): void => {
		this.isLinked = true;
	}
}
