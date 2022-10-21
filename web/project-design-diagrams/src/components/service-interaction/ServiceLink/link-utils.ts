/**
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
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

import { PortModel } from '@projectstorm/react-diagrams';
import { ServiceNodeModel } from '../ServiceNode/ServiceNodeModel';
import { Parameter, RemoteFunction, ResourceFunction } from '../../../resources';

export function findCallingFunction(targetPort: PortModel): RemoteFunction | ResourceFunction | undefined {
    let targetService: ServiceNodeModel = targetPort.getNode() as ServiceNodeModel;
    let targetFunc: ResourceFunction | RemoteFunction | undefined;

    if (targetService.serviceObject.resources.length > 0) {
        targetFunc = targetService.serviceObject.resources.find(resource =>
            `${resource.resourceId.action}/${resource.identifier}` ===
            targetPort.getID().split(`${targetPort.getOptions().alignment}-`)[1]
        );
    }
    if (!targetFunc && targetService.serviceObject.remoteFunctions.length > 0) {
        targetFunc = targetService.serviceObject.remoteFunctions.find(remoteFunc =>
            remoteFunc.name === targetPort.getID().split(`${targetPort.getOptions().alignment}-`)[1]);
    }
    return targetFunc;
}

export function mapUnionTypes(parameter: Parameter) {
    let displayParam: Map<string[], boolean> = new Map<string[], boolean>();

    parameter.type.map((paramType) => {
        if (paramType) {
            let entityType: string = paramType.endsWith('[]') ? paramType.slice(0, -2) : paramType;
            let isClickable: boolean = entityType.includes(':');
            displayParam.set([paramType, entityType], isClickable);
        }
    })

    return displayParam;
}
