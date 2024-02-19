/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: jsx-no-multiline-js
import React, { useMemo } from "react";
import { Context } from "../Context";
import { useBallerinaVersion, useFullST } from "../Hooks";
import { RecordEditorC } from "./RecordEditorC";
import { RecordEditorProps } from ".";

export function RecordEditorWrapper(props: RecordEditorProps) {
    const {
        model,
        isDataMapper,
        onCancel,
        showHeader,
        expressionInfo,
        langServerRpcClient,
        libraryBrowserRpcClient,
        recordCreatorRpcClient,
        currentFile,
        applyModifications,
        onCancelStatementEditor,
        onClose,
        importStatements,
        currentReferences,
    } = props;
    const {
        ballerinaVersion,
        isFetching: isFetchingBallerinaVersion,
        isError: isErrorBallerinaVersion,
    } = useBallerinaVersion(langServerRpcClient);
    const {
        fullST,
        isFetching: isFetchingFullST,
        isError: isErrorFullST,
    } = useFullST(currentFile.path, langServerRpcClient);

    const contextValue = useMemo(() => {
        if (isFetchingBallerinaVersion || isFetchingFullST) {
            return undefined;
        }

        return {
            props: {
                expressionInfo,
                langServerRpcClient,
                libraryBrowserRpcClient,
                recordCreatorRpcClient,
                currentFile,
                importStatements,
                currentReferences,
                ballerinaVersion,
                fullST,
            },
            api: {
                applyModifications,
                onCancelStatementEditor,
                onClose,
            },
        };
    }, [isFetchingBallerinaVersion, isFetchingFullST]);

    return (
        <Context.Provider value={contextValue}>
            {!isFetchingBallerinaVersion && !isErrorBallerinaVersion && !isFetchingFullST && !isErrorFullST && (
                <RecordEditorC model={model} isDataMapper={isDataMapper} onCancel={onCancel} showHeader={showHeader} />
            )}
        </Context.Provider>
    );
}
