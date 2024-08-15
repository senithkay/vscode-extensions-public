/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useState } from "react";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import {
    LowCodeDiagram,
    initVisitor,
    PositioningVisitor,
    SizingVisitor,
} from "@wso2-enterprise/ballerina-low-code-diagram";
import { NodePosition, STNode, traversNode } from "@wso2-enterprise/syntax-tree";
import styled from "@emotion/styled";
import { STModification } from "@wso2-enterprise/ballerina-core";
import { PanelType, useVisualizerContext } from "../../Context";

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

// interface SequenceDiagramProps {
//     filePath: string;
//     applyModifications: (modifications: STModification[]) => Promise<void>;
// }

export function SequenceDiagram() {
    // const { filePath, applyModifications } = props;
    const { rpcClient } = useRpcContext();
    const { setStatementPosition, parsedST, setParsedST, setActivePanel, activePanel } = useVisualizerContext();

    useEffect(() => {
        getSequenceModel();
    }, []);

    useEffect(() => {
        if (!activePanel?.isActive && activePanel?.contentUpdated) {
            getSequenceModel();
            setActivePanel({ isActive: false, contentUpdated: false });
        }
    }, [activePanel?.isActive]);

    const getSequenceModel = () => {
        rpcClient
            .getLangClientRpcClient()
            .getSyntaxTree()
            .then((model) => {
                const parsedModel = sizingAndPositioningST(model.syntaxTree);
                setParsedST(parsedModel);
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

    const handleAddComponent = (position: NodePosition) => {
        setActivePanel({ isActive: true, name: PanelType.CONSTRUCTPANEL, contentUpdated: false });
        setStatementPosition(position);
    }

    const initialSource = "\nvar var1 = 1;"

    return (
        <>
            <Container>{!!parsedST &&
                <LowCodeDiagram syntaxTree={parsedST} isReadOnly={false} onAddComponent={handleAddComponent} />
            }</Container>
            {/* <PanelContainer title="Components" show={showPanel} onClose={() => { setShowPanel(false) }}>
                {showStatementEditor ? 
                    (
                        <StatementEditorComponent
                                label= {"Variable"}
                                config={{type: "Variable", model: null}}
                                initialSource = {initialSource}
                                applyModifications={applyModifications}
                                currentFile={{
                                    content: "",
                                    path: filePath,
                                    size: 1
                                }}
                                onCancel={cancelStatementEditor}
                                onClose={closeStatementEditor}
                                syntaxTree={parsedST}
                                targetPosition={statementPosition}
                            />
                    )
                    :
                (<NodeList categories={[{
                    title: "Flow Nodes",
                    description: "Flow nodes description",
                    items: [
                        {
                            id: "1",
                            label: "variable",
                            description: "variable description",
                            enabled: true,
                        }
                    ]
                }]} onSelect={(id: string) => {
                    console.log(id);
                    setShowStatementEditor(true);
                }} />)
            }
            </PanelContainer> */}
        </>
    );
}
