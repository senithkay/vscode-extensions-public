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
