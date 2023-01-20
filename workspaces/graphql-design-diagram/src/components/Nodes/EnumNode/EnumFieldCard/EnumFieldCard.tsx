import React from "react";

import { DiagramEngine } from "@projectstorm/react-diagrams";

import { EnumField } from "../../../resources/model";
import { EnumNodeModel } from "../EnumNodeModel";
import { EnumFieldContainer } from "../styles";

interface EnumFieldCardProps {
    engine: DiagramEngine;
    node: EnumNodeModel;
    enumField: EnumField;
}
export function EnumFieldCard(props: EnumFieldCardProps) {
    const { engine, node, enumField } = props;

    return(
        <EnumFieldContainer>
            {enumField.name}
        </EnumFieldContainer>
    );
}
