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
