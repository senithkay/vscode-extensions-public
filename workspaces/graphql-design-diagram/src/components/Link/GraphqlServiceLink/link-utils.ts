import { PortModel } from "@projectstorm/react-diagrams";

import { GraphqlServiceNodeModel } from "../../Nodes/GraphqlServiceNode/GraphqlServiceNodeModel";
import { RemoteFunction, ResourceFunction } from "../../resources/model";

export function findCallingFunction(targetPort: PortModel): RemoteFunction | ResourceFunction | undefined {
    const targetService: GraphqlServiceNodeModel = targetPort.getNode() as GraphqlServiceNodeModel;
    let targetFunc: ResourceFunction | RemoteFunction | undefined;

    if (targetService.serviceObject.resourceFunctions.length > 0) {
        targetFunc = targetService.serviceObject.resourceFunctions.find(resource =>
            resource.identifier ===
            targetPort.getID().split(`${targetPort.getOptions().alignment}-`)[1]
        );
    }
    if (!targetFunc && targetService.serviceObject.remoteFunctions.length > 0) {
        targetFunc = targetService.serviceObject.remoteFunctions.find(remoteFunc =>
            remoteFunc.identifier === targetPort.getID().split(`${targetPort.getOptions().alignment}-`)[1]);
    }
    return targetFunc;
}
