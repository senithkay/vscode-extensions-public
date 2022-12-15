/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */
// tslint:disable: jsx-no-multiline-js jsx-no-lambda
import * as React from 'react';

import { AbstractReactFactory } from '@projectstorm/react-canvas-core';
import { DiagramEngine } from '@projectstorm/react-diagrams-core';
import { PrimitiveBalType } from '@wso2-enterprise/ballerina-low-code-edtior-commons';
import "reflect-metadata";
import { container, injectable, singleton } from "tsyringe";

import { RecordFieldPortModel } from '../../Port';
import { LET_EXPRESSION_SOURCE_PORT_PREFIX } from "../../utils/constants";
import { IDataMapperNodeFactory } from '../commons/DataMapperNode';
import { PrimitiveTypeItemWidget } from '../commons/PrimitiveTypeItemWidget';
import { RecordTypeTreeWidget } from "../commons/RecordTypeTreeWidget/RecordTypeTreeWidget";

import { LetExpressionNode, LET_EXPR_SOURCE_NODE_TYPE } from "./LetExpressionNode";

@injectable()
@singleton()
export class LetExpressionNodeFactory extends AbstractReactFactory<LetExpressionNode, DiagramEngine> implements IDataMapperNodeFactory {
    constructor() {
        super(LET_EXPR_SOURCE_NODE_TYPE);
    }

    generateReactWidget(event: { model: LetExpressionNode; }): JSX.Element {
        return (
            <>
                {event.model.typeDef && event.model.typeDef.typeName === PrimitiveBalType.Record ? (
                    <RecordTypeTreeWidget
                        engine={this.engine}
                        id={`${LET_EXPRESSION_SOURCE_PORT_PREFIX}.${event.model.varName}`}
                        typeDesc={event.model.typeDef}
                        getPort={(portId: string) => event.model.getPort(portId) as RecordFieldPortModel}
                        handleCollapse={(fieldName: string, expand?: boolean) => event.model.context.handleCollapse(fieldName, expand)}
                        valueLabel={event.model.varName}
                    />
                ) : (
                    <PrimitiveTypeItemWidget
                        engine={this.engine}
                        id={`${LET_EXPRESSION_SOURCE_PORT_PREFIX}.${event.model.varName}`}
                        typeDesc={event.model.typeDef}
                        getPort={(portId: string) => event.model.getPort(portId) as RecordFieldPortModel}
                        valueLabel={event.model.varName}
                    />
                )}
            </>
        );
    }

    generateModel(): LetExpressionNode {
        return undefined;
    }
}

container.register("NodeFactory", { useClass: LetExpressionNodeFactory });
