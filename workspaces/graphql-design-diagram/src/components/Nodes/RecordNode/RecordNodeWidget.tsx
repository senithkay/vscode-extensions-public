// tslint:disable: jsx-no-multiline-js
import React from "react";

import { DiagramEngine } from "@projectstorm/react-diagrams";

import { RecordFieldWidget } from "./RecordFields/RecordField";
import { RecordHeadWidget } from "./RecordHead/RecordHead";
import { RecordNodeModel } from "./RecordNodeModel";
import { RecordNode } from "./styles";

interface RecordNodeWidgetProps {
    node: RecordNodeModel;
    engine: DiagramEngine;
}

export function RecordNodeWidget(props: RecordNodeWidgetProps) {
    const { node, engine } = props;

    return(
        <RecordNode>
            <RecordHeadWidget engine={engine} node={node}/>
            {node.recordObject.recordFields.map((field, index) => {
                return(
                    <RecordFieldWidget
                        key={index}
                        node={node}
                        engine={engine}
                        field={field}
                    />
                );
            })
            }
        </RecordNode>
    );
}
