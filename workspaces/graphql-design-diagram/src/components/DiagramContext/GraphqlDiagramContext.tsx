/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content."
 */

// tslint:disable: no-empty jsx-no-multiline-js
import React, { createContext } from "react";

import { IBallerinaLangClient } from "@wso2-enterprise/ballerina-languageclient";
import { CurrentFile } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { NodePosition, STNode } from "@wso2-enterprise/syntax-tree";

interface GraphqlDiagramContextProps {
    children?: React.ReactNode,
    functionPanel?: (position: NodePosition, functionType: string, model?: STNode, filePath?: string, completeST?: STNode) => void;
    servicePanel?: () => void;
    model?: STNode;
    operationDesignView?: (functionPosition: NodePosition, filePath?: string) => void;
    onDelete?: (position: NodePosition) => void;
    fullST?: STNode;
    goToSource?: (filePath: string, position: NodePosition) => void
    recordEditor?: (recordModel: STNode, filePath?: string, completeST?: STNode) => void;
    langClientPromise?: Promise<IBallerinaLangClient>;
    currentFile?: CurrentFile;
    setSelectedNode?: (nodeId: string) => void;
    selectedDiagramNode?: string;
}

export const DiagramContext = createContext({
        functionPanel: (position: NodePosition, functionType: string, model?: STNode, filePath?: string, completeST?: STNode) => {},
        servicePanel: () => {},
        model: undefined,
        operationDesignView: (functionPosition: NodePosition, filePath?: string) => {},
        onDelete: (position: NodePosition) => {},
        fullST: undefined,
        goToSource: (filePath: string, position: NodePosition) => {},
        recordEditor: (recordModel: STNode, filePath?: string, completeST?: STNode) => {},
        langClientPromise: undefined,
        currentFile: undefined,
        setSelectedNode: (nodeId: string) => {},
        selectedDiagramNode: undefined
    }
);

export function GraphqlDiagramContext(props: GraphqlDiagramContextProps) {

    const {
        children,
        functionPanel,
        servicePanel,
        model,
        operationDesignView,
        onDelete,
        fullST,
        goToSource,
        recordEditor,
        langClientPromise,
        currentFile,
        setSelectedNode,
        selectedDiagramNode
    } = props;

    return (
        <DiagramContext.Provider
            value={{
                functionPanel,
                servicePanel,
                model,
                operationDesignView,
                onDelete,
                fullST,
                goToSource,
                recordEditor,
                langClientPromise,
                currentFile,
                setSelectedNode,
                selectedDiagramNode
            }}
        >
            {children}
        </DiagramContext.Provider>
    );
}

export const useGraphQlContext = () => React.useContext(DiagramContext);

