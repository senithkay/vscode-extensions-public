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
// tslint:disable: jsx-no-multiline-js
import * as React from 'react';

import { AbstractReactFactory } from '@projectstorm/react-canvas-core';
import { DiagramEngine } from '@projectstorm/react-diagrams-core';
import "reflect-metadata";
import { container, injectable, singleton } from "tsyringe";

import { RecordFieldPortModel } from "../../Port";
import { IDataMapperNodeFactory } from '../commons/DataMapperNode';
import { RecordTypeTreeWidget } from '../commons/RecordTypeTreeWidget/RecordTypeTreeWidget';

import {
    LetClauseNode,
    QUERY_EXPR_SOURCE_NODE_TYPE
} from './LetClauseNode';
import { EXPANDED_QUERY_SOURCE_PORT_PREFIX } from '../../utils/constants';
import { PrimitiveTypeItemWidget } from '../commons/PrimitiveTypeItemWidget';
import { PrimitiveBalType } from '@wso2-enterprise/ballerina-low-code-edtior-commons';

@injectable()
@singleton()
export class LetClauseNodeFactory extends AbstractReactFactory<LetClauseNode, DiagramEngine> implements IDataMapperNodeFactory {
    constructor() {
        super(QUERY_EXPR_SOURCE_NODE_TYPE);
    }

    generateReactWidget(event: { model: LetClauseNode; }): JSX.Element {
        if(event.model.typeDef.typeName === PrimitiveBalType.Record || event.model.typeDef.typeName === PrimitiveBalType.Array ){
            return (
                <RecordTypeTreeWidget
                    engine={this.engine}
                    id={`${EXPANDED_QUERY_SOURCE_PORT_PREFIX}.${event.model.sourceBindingPattern.variableName.value}`}
                    typeDesc={event.model.typeDef}
                    getPort={(portId: string) => event.model.getPort(portId) as RecordFieldPortModel}
                    handleCollapse={(fieldName: string, expand?: boolean) => event.model.context.handleCollapse(fieldName, expand)}
                    valueLabel={event.model.sourceBindingPattern.variableName.value}
                />
            );
        }
        
        return (
            <PrimitiveTypeItemWidget
                engine={this.engine}
                id={`${EXPANDED_QUERY_SOURCE_PORT_PREFIX}.${event.model.sourceBindingPattern.variableName.value}`}
                typeDesc={event.model.typeDef}
                getPort={(portId: string) => event.model.getPort(portId) as RecordFieldPortModel}
                valueLabel={event.model.sourceBindingPattern.variableName.value}
            />
        )
    }

    generateModel(): LetClauseNode {
        return undefined;
    }
}

container.register("NodeFactory", {useClass: LetClauseNodeFactory});
