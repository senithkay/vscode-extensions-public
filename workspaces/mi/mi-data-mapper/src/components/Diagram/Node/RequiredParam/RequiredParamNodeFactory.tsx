/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React from 'react';

import { AbstractReactFactory } from '@projectstorm/react-canvas-core';
import { DiagramEngine } from '@projectstorm/react-diagrams-core';
import { TypeKind } from '@wso2-enterprise/mi-core';

import { RecordFieldPortModel } from '../../Port';
import { RecordTypeTreeWidget } from "../commons/RecordTypeTreeWidget/RecordTypeTreeWidget";
import { InputSearchNoResultFound, SearchNoResultFoundKind } from "../commons/Search";

import { RequiredParamNode, INPUT_PARAM_NODE_TYPE } from './RequiredParamNode';

export class RequiredParamNodeFactory extends AbstractReactFactory<RequiredParamNode, DiagramEngine> {
    constructor() {
        super(INPUT_PARAM_NODE_TYPE);
    }

    generateReactWidget(event: { model: RequiredParamNode; }): JSX.Element {
        if (event.model.hasNoMatchingFields && !event.model.dmType) {
            return (
                <InputSearchNoResultFound kind={SearchNoResultFoundKind.InputField} />
            );
        } else if (event.model.dmType && event.model.dmType.kind === TypeKind.Interface) {
            return (
                <RecordTypeTreeWidget
                    engine={this.engine}
                    id={event.model.value && (event.model.value.name as any).escapedText}
                    dmType={event.model.dmType}
                    getPort={(portId: string) => event.model.getPort(portId) as RecordFieldPortModel}
                    handleCollapse={undefined}
                    // handleCollapse={(fieldName: string, expand?: boolean) => event.model.context.handleCollapse(fieldName, expand)}
                />
            );
        }
    }

    generateModel(): RequiredParamNode {
        return undefined;
    }
}
