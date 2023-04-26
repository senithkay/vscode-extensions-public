// tslint:disable: jsx-no-lambda
import * as React from 'react';

import { AbstractReactFactory } from '@projectstorm/react-canvas-core';
import { DiagramEngine } from '@projectstorm/react-diagrams-core';
import { PrimitiveBalType } from '@wso2-enterprise/ballerina-low-code-edtior-commons';
import "reflect-metadata";
import { container, injectable, singleton } from "tsyringe";

import { RecordFieldPortModel } from '../../Port';
import { IDataMapperNodeFactory } from '../commons/DataMapperNode';
import { PrimitiveTypeItemWidget } from '../commons/PrimitiveTypeItemWidget';
import { RecordTypeTreeWidget } from "../commons/RecordTypeTreeWidget/RecordTypeTreeWidget";

import { RequiredParamNode, REQ_PARAM_NODE_TYPE } from './RequiredParamNode';

@injectable()
@singleton()
export class RequiredParamNodeFactory extends AbstractReactFactory<RequiredParamNode, DiagramEngine> implements IDataMapperNodeFactory {
    constructor() {
        super(REQ_PARAM_NODE_TYPE);
    }

    generateReactWidget(event: { model: RequiredParamNode; }): JSX.Element {
        if ((event.model.typeDef && event.model.typeDef.typeName === PrimitiveBalType.Record) || event.model.hasNoMatchingFields) {
            return (
                <RecordTypeTreeWidget
                    engine={this.engine}
                    id={event.model.value && event.model.value.paramName.value}
                    typeDesc={event.model.typeDef}
                    getPort={(portId: string) => event.model.getPort(portId) as RecordFieldPortModel}
                    handleCollapse={(fieldName: string, expand?: boolean) => event.model.context.handleCollapse(fieldName, expand)}
                    hasNoMatchingFields={event.model.hasNoMatchingFields}
                />
            );
        }

        return (
            <PrimitiveTypeItemWidget
                engine={this.engine}
                id={event.model.value.paramName.value}
                typeDesc={event.model.typeDef}
                getPort={(portId: string) => event.model.getPort(portId) as RecordFieldPortModel}
                valueLabel={event.model.value.paramName.value}
            />
        )
    }

    generateModel(): RequiredParamNode {
        return undefined;
    }
}

container.register("NodeFactory", { useClass: RequiredParamNodeFactory });
