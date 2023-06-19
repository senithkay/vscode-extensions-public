/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content."
 */

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

    return (
        <RecordNode>
            <RecordHeadWidget engine={engine} node={node}/>
            {node.recordObject.recordFields.map((field, index) => {
                return (
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
