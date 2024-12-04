/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useState } from "react";

import {
    FlowNode,
    IDMModel,
    InlineDataMapperSourceRequest,
    InputCategory,
    LinePosition,
    Mapping,
    SubPanel,
    SubPanelView,
    TypeKind
} from "@wso2-enterprise/ballerina-core";
import { DataMapperView } from "@wso2-enterprise/ballerina-inline-data-mapper";
import { ProgressIndicator } from "@wso2-enterprise/ui-toolkit";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import { ExpressionFormField } from "@wso2-enterprise/ballerina-side-panel";

import { useInlineDataMapperModel } from "../../Hooks";

interface InlineDataMapperProps {
    filePath: string;
    flowNode: FlowNode;
    propertyKey: string;
    editorKey: string;
    position: LinePosition;
    onClosePanel: (subPanel: SubPanel) => void;
    updateFormField: (data: ExpressionFormField) => void;
}

export function InlineDataMapper(props: InlineDataMapperProps) {
    const { filePath, flowNode, propertyKey, editorKey, position, onClosePanel, updateFormField } = props;

    const [isFileUpdateError, setIsFileUpdateError] = useState(false);
    const [model, setModel] = useState<IDMModel>(null);

    const { rpcClient } = useRpcContext();
    const {
        model: initialModel,
        isFetching,
        isError
    } = useInlineDataMapperModel(filePath, flowNode, propertyKey, position);

    useEffect(() => {
        if (initialModel) {
            setModel(initialModel);
        }
    }, [initialModel]);

    const onClose = () => {
        onClosePanel({ view: SubPanelView.UNDEFINED });
    }

    const updateExpression = async (mappings: Mapping[]) => {
        try {
            const updateSrcRequest: InlineDataMapperSourceRequest = {
                filePath,
                flowNode,
                propertyKey,
                position,
                mappings
            };
            const resp = await rpcClient
                .getInlineDataMapperRpcClient()
                .getDataMapperSource(updateSrcRequest);
            // setModel(resp);
            const updateData: ExpressionFormField = {
                value: resp.source,
                key: editorKey,
                cursorPosition: position
            }
            updateFormField(updateData);
        } catch (error) {
            console.error(error);
            setIsFileUpdateError(true);
        }
    };

    useEffect(() => {
        // Hack to hit the error boundary
        if (isError) {
            throw new Error("Error while fetching input/output types");
        } else if (isFileUpdateError) {
            throw new Error("Error while updating file content");
        } 
    }, [isError]);

    const model1: IDMModel = {
        "inputs": [
            {
                "fields": [
                    {
                        "member": {
                            "id": "u1.phoneNumber",
                            "typeName": "string",
                            "kind": TypeKind.String
                        },
                        "id": "u1.phoneNumber",
                        "variableName": "u1.phoneNumber",
                        "typeName": "phoneNumber",
                        "kind": TypeKind.Array
                    }
                ],
                "id": "u1",
                "variableName": "u1",
                "typeName": "User",
                "kind": TypeKind.Record,
                "category": InputCategory.ModuleVariable
            },
            {
                "fields": [
                    {
                        "member": {
                            "id": "user.phoneNumber",
                            "typeName": "string",
                            "kind": TypeKind.String
                        },
                        "id": "user.phoneNumber",
                        "variableName": "user.phoneNumber",
                        "typeName": "phoneNumber",
                        "kind": TypeKind.Array
                    }
                ],
                "id": "user",
                "variableName": "user",
                "typeName": "User",
                "kind": TypeKind.Record
            }
        ],
        "output": {
            "fields": [
                {
                    "member": {
                        "id": "var1.contacts",
                        "typeName": "string",
                        "kind": TypeKind.String
                    },
                    "id": "var1.contacts",
                    "variableName": "var1.contacts",
                    "typeName": "contacts",
                    "kind": TypeKind.Array
                }
            ],
            "id": "var1",
            "variableName": "var1",
            "typeName": "Person",
            "kind": TypeKind.Record
        },
        "mappings": [
            {
                "inputs": [],
                "output": "var1.contacts",
                "expression": "[\"123\", \"456\"]",
                "elements": [
                    {
                        "inputs": [],
                        "output": "var1.contacts.0",
                        "expression": "123"
                    },
                    {
                        "inputs": [],
                        "output": "var1.contacts.1",
                        "expression": "456"
                    }
                ]
            }
        ],
        "source": "Person var1 = {\n    contacts: [\"123\", \"456\"]\n};",
        view: "source"
    };

    const model2: IDMModel = {
        "inputs": [
            {
                "fields": [
                    {
                        "member": {
                            "id": "u1.phoneNumber",
                            "typeName": "string",
                            "kind": TypeKind.String
                        },
                        "id": "u1.phoneNumber",
                        "variableName": "u1.phoneNumber",
                        "typeName": "phoneNumber",
                        "kind": TypeKind.Array
                    }
                ],
                "id": "u1",
                "variableName": "u1",
                "typeName": "User",
                "kind": TypeKind.Record,
                "category": InputCategory.ModuleVariable
            },
            {
                "fields": [
                    {
                        "member": {
                            "id": "user.phoneNumber",
                            "typeName": "string",
                            "kind": TypeKind.String
                        },
                        "id": "user.phoneNumber",
                        "variableName": "user.phoneNumber",
                        "typeName": "phoneNumber",
                        "kind": TypeKind.Array
                    }
                ],
                "id": "user",
                "variableName": "user",
                "typeName": "User",
                "kind": TypeKind.Record
            }
        ],
        "output": {
            "fields": [
                {
                    "member": {
                        "member": {
                            "id": "var2.contacts",
                            "typeName": "string",
                            "kind": TypeKind.String
                        },
                        "id": "var2.contacts",
                        "kind": TypeKind.Array
                    },
                    "id": "var2.contacts",
                    "variableName": "var2.contacts",
                    "typeName": "contacts",
                    "kind": TypeKind.Array
                }
            ],
            "id": "var2",
            "variableName": "var2",
            "typeName": "Person2",
            "kind": TypeKind.Record
        },
        "mappings": [
            {
                "inputs": [],
                "output": "var2.contacts",
                "expression": "[[\"123\", \"456\"], [\"789\"]]",
                "elements": [
                    {
                        "inputs": [],
                        "output": "var2.contacts.0",
                        "expression": "[\"123\", \"456\"]",
                        "elements": [
                            {
                                "inputs": [],
                                "output": "var2.contacts.0.0",
                                "expression": "123"
                            },
                            {
                                "inputs": [],
                                "output": "var2.contacts.0.1",
                                "expression": "456"
                            }
                        ]
                    },
                    {
                        "inputs": [],
                        "output": "var2.contacts.1",
                        "expression": "[\"789\"]",
                        "elements": [
                            {
                                "inputs": [],
                                "output": "var2.contacts.1.0",
                                "expression": "789"
                            }
                        ]
                    }
                ]
            }
        ],
        "source": "Person2 var2 = {\n    contacts: [[\"123\", \"456\"], [\"789\"]]\n};",
        view: "source"
    };

    const model3: IDMModel = {
        "inputs": [
            {
                "fields": [
                    {
                        "member": {
                            "id": "u1.phoneNumber",
                            "typeName": "string",
                            "kind": TypeKind.String
                        },
                        "id": "u1.phoneNumber",
                        "variableName": "phoneNumber",
                        "typeName": "string[]",
                        "kind": TypeKind.Array
                    }
                ],
                "id": "u1",
                "variableName": "u1",
                "typeName": "User",
                "kind": TypeKind.Record,
                "category": InputCategory.ModuleVariable
            },
            {
                "fields": [
                    {
                        "member": {
                            "id": "user.phoneNumber",
                            "typeName": "string",
                            "kind": TypeKind.String
                        },
                        "id": "user.phoneNumber",
                        "variableName": "phoneNumber",
                        "typeName": "string[]",
                        "kind": TypeKind.Array
                    }
                ],
                "id": "user",
                "variableName": "user",
                "typeName": "User",
                "kind": TypeKind.Record,
                "category": InputCategory.ModuleVariable
            }
        ],
        "output": {
            "fields": [
                {
                    "member": {
                        "fields": [
                            {
                                "id": "var3.contacts.primaryPhome",
                                "variableName": "primaryPhome",
                                "typeName": "string",
                                "kind": TypeKind.String
                            },
                            {
                                "id": "var3.contacts.secondaryPhone",
                                "variableName": "secondaryPhone",
                                "typeName": "string",
                                "kind": TypeKind.String
                            }
                        ],
                        "id": "var3.contacts",
                        "typeName": "Contact",
                        "kind": TypeKind.Record
                    },
                    "id": "var3.contacts",
                    "variableName": "contacts",
                    "typeName": "Contact[]",
                    "kind": TypeKind.Array
                }
            ],
            "id": "var3",
            "variableName": "var3",
            "typeName": "Person3",
            "kind": TypeKind.Record
        },
        "mappings": [
            {
                "output": "var3.contacts",
                "inputs": [],
                "expression": "[\n        {\n            primaryPhome: \"\",\n            secondaryPhone: \"\"\n        }\n    ]\n",
                "diagnostics": [],
                "elements": [
                    {
                        "output": "var3.contacts.0.primaryPhome",
                        "inputs": [],
                        "expression": "\"\"",
                        "diagnostics": [],
                        "elements": []
                    },
                    {
                        "output": "var3.contacts.0.secondaryPhone",
                        "inputs": [],
                        "expression": "\"\"\n",
                        "diagnostics": [],
                        "elements": []
                    }
                ]
            }
        ],
        "source": "Person3 var3 = {\n    contacts: [\n        {\n            primaryPhome: \"\",\n            secondaryPhone: \"\"\n        }\n    ]\n};",
        "view": "source"
    };

    return (
        <>
            {isFetching && (
                 <ProgressIndicator /> 
            )}
            {model && (
                <DataMapperView 
                    model={model || initialModel} 
                    // model={model3} 
                    onClose={onClose}
                    applyModifications={updateExpression}
                />
            )}
        </>
    );
};

