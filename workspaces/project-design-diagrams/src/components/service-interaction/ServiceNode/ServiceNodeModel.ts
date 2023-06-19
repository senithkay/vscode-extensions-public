/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
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
	readonly modelVersion: string;
	readonly nodeObject: Service;
	readonly serviceType: ServiceTypes;
	readonly targetGateways: GatewayType[];

	constructor(serviceObject: Service, level: Level, version: string, targetGateways?: GatewayType[]) {
		super('serviceNode', serviceObject.serviceId);

		this.level = level;
		this.modelVersion = version;
		this.nodeObject = serviceObject;
		this.serviceType = this.getServiceType();
		this.targetGateways = targetGateways;

		this.addPort(new ServicePortModel(this.nodeObject.serviceId, PortModelAlignment.LEFT));
		this.addPort(new ServicePortModel(this.nodeObject.serviceId, PortModelAlignment.RIGHT));

		if (targetGateways) {
			this.addPort(new ServicePortModel(this.nodeObject.serviceId, PortModelAlignment.TOP));
			this.addPort(new ServicePortModel(this.nodeObject.serviceId, PortModelAlignment.LEFT, true));
		}

		if (level === Level.TWO) {
			this.nodeObject.resources.forEach(resource => {
				this.addPort(new ServicePortModel(`${resource.resourceId.action}/${resource.identifier}`, PortModelAlignment.LEFT));
				this.addPort(new ServicePortModel(`${resource.resourceId.action}/${resource.identifier}`, PortModelAlignment.RIGHT));
			});
			this.nodeObject.remoteFunctions.forEach(remoteFunc => {
				this.addPort(new ServicePortModel(remoteFunc.name, PortModelAlignment.LEFT));
				this.addPort(new ServicePortModel(remoteFunc.name, PortModelAlignment.RIGHT));
			})
		}
	}

	getServiceType = (): ServiceTypes => {
		if (this.nodeObject.serviceType) {
			if (this.nodeObject.serviceType.includes('ballerina/grpc:')) {
				return ServiceTypes.GRPC;
			} else if (this.nodeObject.serviceType.includes('ballerina/http:')) {
				return ServiceTypes.HTTP;
			} else if (this.nodeObject.serviceType.includes('ballerina/graphql:')) {
				return ServiceTypes.GRAPHQL;
			} else if (this.nodeObject.serviceType.includes('ballerina/websocket:')) {
				return ServiceTypes.WEBSOCKET
			} else if (this.nodeObject.serviceType.includes('ballerinax/trigger.')) {
				return ServiceTypes.WEBHOOK;
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
