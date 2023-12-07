import { DefaultPortModel, LinkModel, PortModel, PortModelAlignment, PortModelGenerics } from "@projectstorm/react-diagrams";
import { WorkerLinkModel } from "../Link/LinkModel";

export interface WorkerPortModelGenerics {
	PORT: WorkerPortModel;
}

export class WorkerPortModel extends PortModel<PortModelGenerics & WorkerPortModelGenerics> {
    constructor(id: string, portType: PortModelAlignment) {
        super({
            type: 'workerPort',
            name: `${portType}-${id}`,
            id: `${portType}-${id}`,
            alignment: portType
        });
    }

    createLinkModel(): LinkModel {
        return new WorkerLinkModel("defaultLink");
    }

    canLinkToPort(port: WorkerPortModel): boolean {
		return true;
	}

    
}