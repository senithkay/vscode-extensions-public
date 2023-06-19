/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content."
 */

import React, { useContext } from "react";

import { DiagramEngine } from "@projectstorm/react-diagrams";

import { DiagramContext } from "../../../DiagramContext/GraphqlDiagramContext";
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
    const { setSelectedNode } = useContext(DiagramContext);

    const updateSelectedNode = () => {
        setSelectedNode(field.type);
    }

    return (
        <RecordFieldContainer>
            <GraphqlBasePortWidget
                port={node.getPort(`left-${field.name}`)}
                engine={engine}
            />
            <FieldName>{field.name}</FieldName>
            <div onClick={updateSelectedNode}>
                <FieldType>{field.type}</FieldType>
            </div>
            <GraphqlBasePortWidget
                port={node.getPort(`right-${field.name}`)}
                engine={engine}
            />
        </RecordFieldContainer>
    );
}
