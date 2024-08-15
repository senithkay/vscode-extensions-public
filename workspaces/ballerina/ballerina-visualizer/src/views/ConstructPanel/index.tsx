import React, { useEffect, useState } from "react";
import { PanelContainer, NodeList } from "@wso2-enterprise/ballerina-side-panel";
import { useVisualizerContext } from '../../Context';
import { StatementEditorComponent} from "../StatementEditorComponent"
import { STModification } from "@wso2-enterprise/ballerina-core";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";

interface ConstructPanelProps {
    applyModifications: (modifications: STModification[]) => Promise<void>;
}

export function ConstructPanel(props: ConstructPanelProps) {
    const { applyModifications } = props;
    const { rpcClient } = useRpcContext();
    
    const { activePanel, setActivePanel, statementPosition, parsedST} = useVisualizerContext();
    const [showStatementEditor, setShowStatementEditor] = useState<boolean>(false);
    const [filePath, setFilePath] = useState<string>();

    const initialSource = "\nvar var1 = 1;"

    const closeStatementEditor = () => {
        setShowStatementEditor(false);
        setActivePanel({isActive: false, contentUpdated: true});
    }

    const cancelStatementEditor = () => {
        setShowStatementEditor(false);
    }

    useEffect(() => {
        rpcClient?.getVisualizerLocation().then((location) => {
            setFilePath(location.documentUri);
        });
    }, []);


    return (
        <PanelContainer title="Components" show={activePanel?.isActive} onClose={() => { setActivePanel({isActive: false}) }}>
        {showStatementEditor ? 
                    (
                        <StatementEditorComponent
                                label= {"Variable"}
                                config={{type: "Variable", model: null}}
                                initialSource = {initialSource}
                                applyModifications={applyModifications}
                                currentFile={{
                                    content: "",
                                    path: filePath? filePath: "",
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
    </PanelContainer>
);
}