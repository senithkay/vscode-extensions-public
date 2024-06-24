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

import { useIOTypes, useOperators } from "../../Hooks";

interface DataMapperProps {
    filePath: string;
    functionName?: string;
    fileContent?: string;
    interfacesSource?: string;
    configName: string;
}

export function DataMapper(props: DataMapperProps) {
    const { rpcClient } = useVisualizerContext();
    const { filePath, functionName, fileContent, interfacesSource } = props;

    const [isFileUpdateError, setIsFileUpdateError] = useState(false);

    const { dmIOTypes, isFetchingIOTypes, isIOTypeError } = useIOTypes(filePath, functionName, interfacesSource);

    const { dmOperators, isFetchingOperators, isOperatorsError } = useOperators(filePath)
    
    if(!isFetchingOperators)
    console.log(dmOperators.operators.map(op=>op.name));

    // useEffect(() => {
    //     rpcClient.getMiDataMapperRpcClient().getOperators({ req: "REQ" }).then((res) => {
    //         console.log(res);
    //         setOperators([res.res]);
    //     });
    //   }, []); 
    

    const updateFileContent = async (newContent: string) => {
        try {
            rpcClient.getMiDataMapperRpcClient().addToDMUndoStack(newContent);
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
        if (isIOTypeError) {
            throw new Error("Error while fetching input/output types");
        } else if (isFileUpdateError) {
            throw new Error("Error while updating file content");
        }
    }, [isIOTypeError, isFileUpdateError]);

    return (
        <>
            {isFetchingIOTypes || isFetchingOperators
                ? <ProgressIndicator />
                : (
                    <DataMapperView
                        filePath={filePath}
                        fileContent={fileContent}
                        functionName={functionName}
                        inputTrees={dmIOTypes.inputTrees}
                        outputTree={dmIOTypes.outputTree}
                        updateFileContent={updateFileContent}
                        configName={props.configName}
                        operators={dmOperators.operators.map(op=>op.name)}
                    />
                )
            }
        </>
    );

    // operators={dmOperators.operators.map(op => op.name)}


};
