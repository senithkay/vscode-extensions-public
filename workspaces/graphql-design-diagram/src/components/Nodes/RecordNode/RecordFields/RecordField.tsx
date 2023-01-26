/*
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
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

import React from "react";

import { DiagramEngine } from "@projectstorm/react-diagrams";

import { GraphqlBasePortWidget } from "../../../Port/GraphqlBasePortWidget";
import { RecordField } from "../../../resources/model";
import { FieldName, FieldType } from "../../../resources/styles/styles";
import { RecordNodeModel } from "../RecordNodeModel";
import { RecordFieldContainer } from "../styles";

interface RecordFieldWidgetProps {
    engine: DiagramEngine;
    node: RecordNodeModel;
    field: RecordField;
}

export function RecordFieldWidget(props: RecordFieldWidgetProps) {
    const { engine, node, field } = props;

    return (
        <RecordFieldContainer>
            <GraphqlBasePortWidget
                port={node.getPort(`left-${field.name}`)}
                engine={engine}
            />
            <FieldName>{field.name}</FieldName>
            <FieldType>{field.type}</FieldType>
            <GraphqlBasePortWidget
                port={node.getPort(`right-${field.name}`)}
                engine={engine}
            />
        </RecordFieldContainer>
    );
}
