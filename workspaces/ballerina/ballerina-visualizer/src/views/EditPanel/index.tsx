/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useState } from "react";
import { PanelContainer } from "@wso2-enterprise/ballerina-side-panel";
import { useVisualizerContext } from '../../Context';
import { StatementEditorComponent } from "../StatementEditorComponent"
import { STModification } from "@wso2-enterprise/ballerina-core";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import { shouldSkipSemicolon } from "../ConstructPanel";

interface EditPanelProps {
    applyModifications: (modifications: STModification[]) => Promise<void>;
}

export function EditPanel(props: EditPanelProps) {
    const { applyModifications } = props;
    const { rpcClient } = useRpcContext();
    const { activePanel, setActivePanel, statementPosition, parsedST, componentInfo } = useVisualizerContext();
    const [filePath, setFilePath] = useState<string>();

    const closeStatementEditor = () => {
        setActivePanel({ isActive: false });
    }

    const cancelStatementEditor = () => {
        setActivePanel({ isActive: false });
    }

    useEffect(() => {
        rpcClient?.getVisualizerLocation().then(async (location) => {
            setFilePath(location.documentUri);

        });
    }, []);


    return (
        <>
            {filePath && componentInfo?.model &&
                <PanelContainer title="Edit Construct" show={activePanel?.isActive} onClose={() => { setActivePanel({ isActive: false }) }}>
                    (
                    <StatementEditorComponent
                        label={componentInfo.componentType}
                        config={{ type: componentInfo.componentType, model: componentInfo.model }}
                        initialSource={componentInfo.model?.source}
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
                        skipSemicolon={shouldSkipSemicolon(componentInfo?.componentType)}
                    />
                    )
                </PanelContainer>
            }
        </>
    );
}

