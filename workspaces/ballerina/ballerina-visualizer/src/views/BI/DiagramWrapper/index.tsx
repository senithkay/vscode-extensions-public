/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { useState } from "react";
import { STNode } from "@wso2-enterprise/syntax-tree";
import { Switch, View } from "@wso2-enterprise/ui-toolkit";
import { BIFlowDiagram } from "../FlowDiagram";
import { BISequenceDiagram } from "../SequenceDiagram";

export interface DiagramWrapperProps {
    syntaxTree: STNode;
    projectPath: string;
}

export function DiagramWrapper(param: DiagramWrapperProps) {
    const { syntaxTree, projectPath } = param;
    const [showSequenceDiagram, setShowSequenceDiagram] = useState(false);

    const handleToggleDiagram = () => {
        setShowSequenceDiagram(!showSequenceDiagram);
    };

    return (
        <View>
            <Switch
                leftLabel="Flow"
                rightLabel="Sequence"
                checked={showSequenceDiagram}
                checkedColor="var(--vscode-button-background)"
                enableTransition={true}
                onChange={handleToggleDiagram}
                sx={{
                    margin: "auto",
                    position: "fixed",
                    top: "30px",
                    right: "20px",
                    zIndex: "3",
                    border: "unset",
                }}
                disabled={false}
            />
            {showSequenceDiagram ? (
                <BISequenceDiagram />
            ) : (
                <BIFlowDiagram syntaxTree={syntaxTree} projectPath={projectPath} />
            )}
        </View>
    );
}

export default DiagramWrapper;
