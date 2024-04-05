/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from "react";

import { DataMapperView } from "@wso2-enterprise/mi-data-mapper";
import { ProgressIndicator } from "@wso2-enterprise/ui-toolkit";
import { useFileContent, useIOTypes } from "../../Hooks";

interface DataMapperProps {
    filePath: string;
    functionName: string;
}

export function DataMapper(props: DataMapperProps) {
    const { filePath, functionName } = props;

    const { dmIOTypes, isFetchingIOTypes, isTypeError } = useIOTypes(filePath, functionName);
    const { dmFileContent, isFetchingFileContent, isFileError } = useFileContent(filePath);

    const isFetching = isFetchingIOTypes || isFetchingFileContent;
    const isError = isTypeError || isFileError;

    if (isError) {
        console.error("Error fetching DM metadata");
    } else if (!isFetching) {
        console.log("IO Types", dmIOTypes);
        console.log("File Content", dmFileContent);
    }

    return (
        <>
            {isError && <div>Error fetching DM metadata</div>}
            {isFetching
                ? <ProgressIndicator />
                : (
                    <DataMapperView
                        filePath={filePath}
                        fileContent={dmFileContent}
                        functionName={functionName}
                        inputTrees={dmIOTypes.inputTrees}
                        outputTree={dmIOTypes.outputTree}
                    />
                )
            }
        </>
    );
};
