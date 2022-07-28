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
import { STKindChecker } from "@wso2-enterprise/syntax-tree";
import "reflect-metadata";
import { container, injectable, singleton } from "tsyringe";

import { DataMapperPortModel } from '../../Port';
import { IDataMapperNodeFactory } from '../commons/DataMapperNode';
import { MappingConstructorWidget } from "../commons/MappingConstructorWidget/MappingConstructorWidget";

import { EXPANDED_QUERY_TARGET_PORT_PREFIX, SelectClauseNode, SELECT_CLAUSE_NODE_TYPE } from './SelectClauseNode';

@injectable()
@singleton()
export class SelectClauseFactory extends AbstractReactFactory<SelectClauseNode, DiagramEngine> implements IDataMapperNodeFactory {
    constructor() {
        super(SELECT_CLAUSE_NODE_TYPE);
    }

    generateReactWidget(event: { model: SelectClauseNode; }): JSX.Element {
        return (
            <>
                {STKindChecker.isMappingConstructor(event.model.value.expression) && (
                    <MappingConstructorWidget
                        engine={this.engine}
                        id={EXPANDED_QUERY_TARGET_PORT_PREFIX}
                        value={event.model.value.expression}
                        getPort={(portId: string) => event.model.getPort(portId) as DataMapperPortModel}
                    />
                )}
            </>
        );
    }

    generateModel(event: { initialConfig: any }): any {
        return undefined;
    }
}

container.register("NodeFactory", {useClass: SelectClauseFactory});
