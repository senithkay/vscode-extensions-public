import { PortModel, PortModelAlignment } from "@projectstorm/react-diagrams";

export class GraphqlNodeBasePort extends PortModel {
    constructor(id: string, portType: PortModelAlignment) {
        super({
            name: `${portType}-${id}`,
            id: `${portType}-${id}`,
            alignment: portType
        });
    }

    isLocked(): boolean {
        return true;
    }
}
