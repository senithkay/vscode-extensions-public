/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useState } from "react";

import { ProgressIndicator } from "@wso2-enterprise/ui-toolkit";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import { DataMapperView } from "@wso2-enterprise/ballerina-inline-data-mapper";

import { useIOTypes } from "../../Hooks";

interface DataMapperProps {
    filePath: string;
}

export function InlineDataMapper(props: DataMapperProps) {
    const { rpcClient } = useRpcContext();
    const { filePath } = props;

    const [isFileUpdateError, setIsFileUpdateError] = useState(false);

    const { dmIOTypes, isFetchingIOTypes, isIOTypeError } = useIOTypes(filePath);

    // const applyRecordModifications = async (modifications: STModification[]) => {
    //     await props.applyModifications(modifications, true);
    // };

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
            {isFetchingIOTypes
                ? <ProgressIndicator />
                : (
                    <DataMapperView
                        filePath={filePath}
                        fileContent={undefined}
                        functionName={undefined}
                        inputTrees={dmIOTypes?.inputTypes}
                        outputTree={dmIOTypes?.outputType}
                        updateFileContent={undefined}
                        configName={undefined}
                    />
                )
            }
        </>
    );

};
