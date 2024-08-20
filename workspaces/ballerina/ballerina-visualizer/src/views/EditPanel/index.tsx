import React, { useEffect, useState } from "react";
import { PanelContainer, NodeList } from "@wso2-enterprise/ballerina-side-panel";
import { useVisualizerContext } from '../../Context';
import { StatementEditorComponent} from "../StatementEditorComponent"
import { STModification } from "@wso2-enterprise/ballerina-core";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";


interface EditPanelProps {
    applyModifications: (modifications: STModification[]) => Promise<void>;
}

export function EditPanel(props: EditPanelProps) {
    const { applyModifications } = props;
    const { rpcClient } = useRpcContext();

    
    
    const { activePanel, setActivePanel, statementPosition, parsedST, componentInfo} = useVisualizerContext();
    const [showStatementEditor, setShowStatementEditor] = useState<boolean>(false);
    const [filePath, setFilePath] = useState<string>();

    const closeStatementEditor = () => {
        setShowStatementEditor(false);
        setActivePanel({isActive: false, contentUpdated: true});
    }

    const cancelStatementEditor = () => {
        setShowStatementEditor(false);
    }

    useEffect(() => {

        rpcClient?.getVisualizerLocation().then(async (location) => {
            setFilePath(location.documentUri);

        });

       
    }, []);


    return (
        <PanelContainer title="Edit Component" show={activePanel?.isActive} onClose={() => { setActivePanel({isActive: false}) }}>
            {filePath &&
                    (
                        <StatementEditorComponent
                                label= {"Variable"}
                                config={{type: "Variable", model: null}}
                                initialSource = {componentInfo?.model?.source || ""}
                                applyModifications={applyModifications}
                                currentFile={{
                                    content: parsedST?.source || "",
                                    path: filePath,
                                    size: 1
                                }}
                                onCancel={cancelStatementEditor}
                                onClose={closeStatementEditor}
                                syntaxTree={parsedST}
                                targetPosition={componentInfo?.position || statementPosition}
                            />
                    )
                    }
    </PanelContainer>
);
}



