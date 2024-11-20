/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect } from "react";

import { FlowNode, LinePosition } from "@wso2-enterprise/ballerina-core";
import { DataMapperView } from "@wso2-enterprise/ballerina-inline-data-mapper";

import { useInlineDataMapperModel } from "../../Hooks";
import { ProgressIndicator } from "@wso2-enterprise/ui-toolkit";

interface InlineDataMapperProps {
    filePath: string;
    flowNode: FlowNode;
    propertyKey: string;
    position: LinePosition;
}

export function InlineDataMapper(props: InlineDataMapperProps) {
    const { filePath, flowNode, propertyKey, position } = props;

    const { model, isFetching, isError } = useInlineDataMapperModel(filePath, flowNode, propertyKey, position);


    useEffect(() => {
        // Hack to hit the error boundary
        if (isError) {
            throw new Error("Error while fetching inline data mapper model");
        }
    }, [isError]);

    // const model: IDMModel = {
    //     inputTypes: [
    //         {
    //             id: "input1",
    //             category: InputCategory.ModuleVariable,
    //             kind: TypeKind.Record,
    //             "typeName": "Person",
    //             "fields": [
    //                 {
    //                     "id": "input1.name",
    //                     "kind": TypeKind.String,
    //                     "fieldName": "name"
    //                 },
    //                 {
    //                     "id": "input1.age",
    //                     "kind": TypeKind.Int,
    //                     "fieldName": "age"
    //                 },
    //                 {
    //                     "id": "input1.isStudent",
    //                     "kind": TypeKind.Boolean,
    //                     "fieldName": "isStudent",
    //                     "optional": true
    //                 }
    //             ]
    //         },
    //         {
    //             "id": "input2",
    //             "category": InputCategory.Const,
    //             "kind": TypeKind.Array,
    //             "memberType": {
    //                 "id": "input2.member",
    //                 "kind": TypeKind.String,
    //             }
    //         },
    //         {
    //             "id": "input3",
    //             "category": InputCategory.Configurable,
    //             "kind": TypeKind.Decimal,
    //             "typeName": "decimal",
    //             "defaultValue": 0.0
    //         }
    //     ],
    //     "outputType": {
    //         "id": "output",
    //         "kind": TypeKind.Record,
    //         "typeName": "Output",
    //         "fields": [
    //             {
    //                 "id": "output.fullName",
    //                 "kind": TypeKind.String,
    //                 "fieldName": "fullName",
    //             },
    //             {
    //                 "id": "output.ageGroup",
    //                 "kind": TypeKind.String,
    //                 "fieldName": "ageGroup"
    //             },
    //             {
    //                 "id": "output.tags",
    //                 "kind": TypeKind.Array,
    //                 "fieldName": "tags",
    //                 "memberType": {
    //                     "id": "output.tags.member",
    //                     "kind": TypeKind.String
    //                 }
    //             },
    //             {
    //                 "id": "output.salary",
    //                 "kind": TypeKind.Decimal,
    //                 "fieldName": "salary",
    //                 "optional": true
    //             }
    //         ]
    //     },
    //     mappings: [
    //         {
    //             "output": "output.fullName",
    //             "inputs": ["input1.name"],
    //             "expression": "input1.name",
    //             "diagnostics": []
    //         },
    //         {
    //             "output": "output.ageGroup",
    //             "inputs": ["input1.age"],
    //             "expression": "input1.age >= 18 ? \"Adult\" : \"Minor\"",
    //             "diagnostics": [],
    //             "isComplex": true
    //         },
    //         {
    //             "output": "output.tags.0",
    //             "inputs": ["input2"],
    //             "expression": "input2",
    //             "diagnostics": []
    //         },
    //         {
    //             "output": "output.salary",
    //             "inputs": ["input3"],
    //             "expression": "input3 * 2",
    //             "diagnostics": [
    //                 {
    //                     "kind": "warning",
    //                     "message": "Potential loss of precision when multiplying decimal values",
    //                     range: {
    //                         start: {
    //                             line: 1,
    //                             character: 1
    //                         },
    //                         end: {
    //                             line: 1,
    //                             character: 1
    //                         }
    //                     }
    //                 }
    //             ],
    //             "isComplex": true
    //         }
    //     ]
    // };

    return (
        <>
            {isFetching ? <ProgressIndicator /> : <DataMapperView model={model} />}
        </>
    );
};
