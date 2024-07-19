/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useState } from "react";
import { useVisualizerContext } from "@wso2-enterprise/ballerina-rpc-client";
import {
    LowCodeDiagram,
    initVisitor,
    PositioningVisitor,
    SizingVisitor,
} from "@wso2-enterprise/ballerina-low-code-diagram";
import { STNode, traversNode } from "@wso2-enterprise/syntax-tree";
import { PanelContainer, NodeList } from "@wso2-enterprise/ballerina-side-panel";
import styled from "@emotion/styled";

enum MESSAGE_TYPE {
    ERROR,
    WARNING,
    INFO,
}

const Container = styled.div`
    width: 100%;
    height: calc(100vh - 50px);
`;

const MessageContainer = styled.div({
    width: "100%",
    height: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
});

export function SequenceDiagram() {
    const { rpcClient } = useVisualizerContext();

    const [st, setSt] = useState<STNode>();
    const [showPanel, setShowPanel] = useState<boolean>(false);

    useEffect(() => {
        getSequenceModel();
    }, []);

    const getSequenceModel = () => {
        rpcClient
            .getLangClientRpcClient()
            .getSyntaxTree()
            .then((model) => {
                const parsedModel = sizingAndPositioningST(model.syntaxTree);
                setSt(parsedModel);
            });
    };

    // TODO: Refactor this function
    function sizingAndPositioningST(
        st: STNode,
        experimentalEnabled?: boolean,
        showMessage?: (
            arg: string,
            messageType: MESSAGE_TYPE,
            ignorable: boolean,
            filePath?: string,
            fileContent?: string,
            bypassChecks?: boolean
        ) => void
    ): STNode {
        traversNode(st, initVisitor);
        const sizingVisitor = new SizingVisitor(experimentalEnabled);
        traversNode(st, sizingVisitor);
        if (showMessage && sizingVisitor.getConflictResulutionFailureStatus()) {
            showMessage(
                "Something went wrong in the diagram rendering.",
                MESSAGE_TYPE.ERROR,
                false,
                undefined,
                undefined,
                true
            );
        }
        traversNode(st, new PositioningVisitor());
        const clone = { ...st };
        return clone;
    }

    return (
        <>
            <Container>{!!st && 
                <LowCodeDiagram syntaxTree={st} isReadOnly={false} onAddComponent={() => { setShowPanel(true) }} />
            }</Container>
            <PanelContainer show={showPanel} onClose={() => { setShowPanel(false) }}>
                <NodeList categories={[]} onSelect={(id: string) => { }} />
            </PanelContainer>
        </>
    );
}
