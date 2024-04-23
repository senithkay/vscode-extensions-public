/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useState } from "react";

import { DataMapperView } from "@wso2-enterprise/mi-data-mapper";
import { ProgressIndicator } from "@wso2-enterprise/ui-toolkit";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";

import { useIOTypes } from "../../Hooks";
import { Range } from "@wso2-enterprise/mi-core";

interface DataMapperProps {
    filePath: string;
    functionName?: string;
    fileContent?: string;
}

export function DataMapper(props: DataMapperProps) {
    const { rpcClient } = useVisualizerContext();
    const { filePath, functionName, fileContent } = props;
    const [isFileUpdateError, setIsFileUpdateError] = useState(false);

    const { dmIOTypes, isFetchingIOTypes, isTypeError } = useIOTypes(filePath, functionName);

    const updateFileContent = async (newContent: string) => {
        try {
            await rpcClient
                .getMiDataMapperRpcClient()
                .updateFileContent({ filePath, fileContent: newContent });
        } catch (error) {
            console.error(error);
            setIsFileUpdateError(true);
        }
    };

    useEffect(() => {
        // Hack to hit the error boundary
        if (isTypeError) {
            throw new Error("Error while fetching input/output types");
        } else if (isFileUpdateError) {
            throw new Error("Error while updating file content");
        }
    }, [isTypeError, isFileUpdateError]);

    const goToSource = (range: Range) => {
        rpcClient.getMiVisualizerRpcClient().goToSource({ filePath, position: range });
    };

    return (
        <>
            {isFetchingIOTypes
                ? <ProgressIndicator />
                : (
                    <DataMapperView
                        filePath={filePath}
                        fileContent={fileContent}
                        functionName={functionName}
                        inputTrees={dmIOTypes.inputTrees}
                        outputTree={dmIOTypes.outputTree}
                        goToSource={goToSource}
                        updateFileContent={updateFileContent}
                    />
                )
            }
        </>
    );
};
