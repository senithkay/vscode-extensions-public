import React, { useEffect, useState } from "react";
import { PanelContainer, NodeList } from "@wso2-enterprise/ballerina-side-panel";
import { useVisualizerContext } from '../../Context';
import { StatementEditorComponent } from "../StatementEditorComponent"
import { getAllVariables, getInitialSource, STModification } from "@wso2-enterprise/ballerina-core";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import { getSymbolInfo } from "@wso2-enterprise/ballerina-low-code-diagram";
import { constructList, getTemplateValues } from "./constructList";

interface ConstructPanelProps {
    applyModifications: (modifications: STModification[]) => Promise<void>;
}

export function ConstructPanel(props: ConstructPanelProps) {
    const { applyModifications } = props;
    const { rpcClient } = useRpcContext();

    const { activePanel, setActivePanel, statementPosition, parsedST } = useVisualizerContext();
    const [showStatementEditor, setShowStatementEditor] = useState<boolean>(false);
    const [filePath, setFilePath] = useState<string>();
    const [initialSource, setInitialSource] = useState<string>();
    const [selectedNode, setSelectedNode] = useState<string>();

    const closeStatementEditor = () => {
        setShowStatementEditor(false);
        setActivePanel({ isActive: false });
    }

    const cancelStatementEditor = () => {
        setShowStatementEditor(false);
    }

    useEffect(() => {
        rpcClient?.getVisualizerLocation().then(async (location) => {
            setFilePath(location.documentUri);
        });
    }, []);

    const handleOnSelectNode = (nodeId: string) => {
        console.log(nodeId);
        // create the intial source for the statement editor
        const stSymbolInfo = getSymbolInfo();
        const allVariables = stSymbolInfo ? getAllVariables(stSymbolInfo) : [];
        if (nodeId === "If") {
            const ifTemplateValues = getTemplateValues("IfStatement", allVariables);
            const initialSource = getInitialSource(ifTemplateValues);
            const elseTemplateValues = getTemplateValues("ElseStatement", allVariables);
            const elseInitialSource = getInitialSource(elseTemplateValues);
            setInitialSource(initialSource + elseInitialSource);
        } else {
            const templateValues = getTemplateValues(nodeId, allVariables);
            const initialSource = getInitialSource(templateValues);
            setInitialSource(initialSource);
        }

        setSelectedNode(nodeId);
        setShowStatementEditor(true);
    }


    return (
        <PanelContainer title="Components" show={activePanel?.isActive} onClose={() => { setActivePanel({ isActive: false }) }}>
            {showStatementEditor && filePath ?
                (
                    <StatementEditorComponent
                        label={selectedNode}
                        config={{ type: selectedNode, model: null }}
                        initialSource={initialSource}
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
                        skipSemicolon={shouldSkipSemicolon(selectedNode)}

                    />
                )
                :
                (<NodeList categories={constructList()} onSelect={handleOnSelectNode} />)
            }
        </PanelContainer>
    );
}

export function shouldSkipSemicolon(nodeId: string) {
    if (nodeId === "If" || nodeId === "While" || nodeId === "Foreach") {
        return true;
    }
}
