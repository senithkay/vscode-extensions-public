/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { CMParameter as Parameter, CMRemoteFunction as RemoteFunction, CMResourceFunction as ResourceFunction } from '@wso2-enterprise/ballerina-languageclient';
import { PortModel } from '@projectstorm/react-diagrams';
import { ServiceNodeModel } from '../ServiceNode/ServiceNodeModel';

export function findCallingFunction(targetPort: PortModel): RemoteFunction | ResourceFunction | undefined {
    let targetService: ServiceNodeModel = targetPort.getNode() as ServiceNodeModel;
    let targetFunc: ResourceFunction | RemoteFunction | undefined;

    if (targetService.nodeObject.resourceFunctions.length > 0) {
        targetFunc = targetService.nodeObject.resourceFunctions.find(resource =>
            resource.id === targetPort.getID().split(`${targetPort.getOptions().alignment}-`)[1]
        );
    }
    if (!targetFunc && targetService.nodeObject.remoteFunctions.length > 0) {
        targetFunc = targetService.nodeObject.remoteFunctions.find(remoteFunc =>
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
