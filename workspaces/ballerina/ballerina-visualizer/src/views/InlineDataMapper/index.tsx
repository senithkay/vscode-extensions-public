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
import { Range } from "@wso2-enterprise/ballerina-core";
import { DataMapperView } from "@wso2-enterprise/ballerina-inline-data-mapper";

import { useIOTypes, useSTNodeByRange } from "../../Hooks";

interface DataMapperProps {
    filePath: string;
    range: Range;
}

export function InlineDataMapper(props: DataMapperProps) {
    const { filePath, range } = props;

    const [isFileUpdateError, setIsFileUpdateError] = useState(false);

    const { dmIOTypes, isFetchingIOTypes, isIOTypeError } = useIOTypes(filePath);
    const { stNode, isFetchingSTNode, isSTNodeError } = useSTNodeByRange(filePath, range);

    // const applyRecordModifications = async (modifications: STModification[]) => {
    //     await props.applyModifications(modifications, true);
    // };

    useEffect(() => {
        // Hack to hit the error boundary
        if (isIOTypeError) {
            throw new Error("Error while fetching input/output types");
        } else if (isSTNodeError) {
            throw new Error("Error while fetching STNode");
        } else if (isFileUpdateError) {
            throw new Error("Error while updating file content");
        } 
    }, [isIOTypeError, isFileUpdateError]);

    return (
        <>
            {isFetchingIOTypes || isFetchingSTNode
                ? <ProgressIndicator />
                : (
                    <DataMapperView
                        filePath={filePath}
                        stNode={stNode.syntaxTree}
                        inputTrees={dmIOTypes?.inputTypes}
                        outputTree={dmIOTypes?.outputType}
                    />
                )
            }
        </>
    );

};
