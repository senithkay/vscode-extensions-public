/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from "react";
import { SequenceDiagram } from "./Sequence";
import { traversNode } from "@wso2-enterprise/mi-syntax-tree/lib/src";
import { NodeInitVisitor } from "../../utils/visitors/NodeInitVisitor";

interface Props {
    name: string;
    stNode: any;
    documentUri: string;
}

export function ResourceCompartment(props: React.PropsWithChildren<Props>) {
    const visitor = new NodeInitVisitor(props.documentUri);
    traversNode(props.stNode.api, visitor);

    const inSequenceNodes = visitor.getInSequenceNodes();
    const outSequenceNodes = visitor.getOutSequenceNodes();

    return (
        <>
            {/* Input & Output sequences */}
            <SequenceDiagram inSequence={inSequenceNodes} outSequence={outSequenceNodes}></SequenceDiagram>

            <div style={{
                flex: "0 0 100px",
                marginTop: "10px",
                overflow: "hidden",
                borderStyle: "solid",
                borderWidth: "1px",
                borderColor: "var(--vscode-panel-dropBorder)"
            }}>
                {/* Fault sequences */}
                {props.children}
            </div>
        </>
    );
};

