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
import { useFunctionST, useIOTypes } from "../../Hooks";

interface DataMapperProps {
    filePath: string;
}

const filePathTemp = "/Users/madusha/play/mi/mi-hw/HelloWorldService/src/main/wso2mi/resources/data-mapper/sample.ts";
const functionName = "tnf2";

export function DataMapper(props: DataMapperProps) {
    const { filePath } = props;

    const { dmIOTypes, isFetching: isFetchingIOTypes, isError: isTypeError } = useIOTypes(filePathTemp, functionName);
    const { dmFnST, isFetching: isFetchingFnST, isError: isFnSTError } = useFunctionST(filePathTemp, functionName);

    const isFetching = isFetchingIOTypes || isFetchingFnST;

    if (isTypeError) {
        console.error("Error fetching IO types !!!");
    } 
    if (isFnSTError) {
        console.error("Error fetching function ST !!!");
    } else if (!isFetching) {
        console.log("IO Types", dmIOTypes);
        console.log("Function ST", dmFnST);
    }

    return (
        <>
            {isFetching
                ? <ProgressIndicator />
                : (
                    <DataMapperView
                        inputTrees={dmIOTypes.inputTrees}
                        outputTree={dmIOTypes.outputTree}
                        fnST={dmFnST.functionST}
                    />
                )
            }
        </>
    );
};
