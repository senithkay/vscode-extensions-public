import { AbstractModelFactory } from '@projectstorm/react-canvas-core';
import { DiagramEngine, PortModel } from '@projectstorm/react-diagrams';
import { RecordField, RecordTypeDesc } from '@wso2-enterprise/syntax-tree';
import { container, injectable, singleton } from 'tsyringe';

import { DataMapperPortModel, PORT_TYPE_ID } from './DataMapperPortModel';

@injectable()
@singleton()
export class DataMapperPortFactory extends AbstractModelFactory<PortModel, DiagramEngine> {

    constructor() {
        super(PORT_TYPE_ID);
    }

    generateModel(event: { initialConfig: { typeNode: RecordField; type: "IN" | "OUT"; parentModel: DataMapperPortModel; }; }): PortModel {
        return undefined;
    }
}
container.register("PortFactory", {useClass: DataMapperPortFactory});
