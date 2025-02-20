/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: jsx-no-multiline-js

import React, { useEffect, useState } from 'react';

import { ActionButtons, AutoComplete, TextField, Codicon, CheckBox, Divider, Typography } from '@wso2-enterprise/ui-toolkit';
import { EditorContentColumn, EditorContainer, EditorContent, ParamContainer, ParamDescription } from '../../../styles';
import { CommonRPCAPI, STModification, StatusCodeResponse, responseCodes } from '@wso2-enterprise/ballerina-core';
import { getTitleFromResponseCode } from '../../../utils';
import { TypeBrowser } from '../../../components/TypeBrowser/TypeBrowser';
import { NodePosition } from '@wso2-enterprise/syntax-tree';
import { FormField } from '@wso2-enterprise/ballerina-side-panel';
import FormGeneratorNew from '../../../../Forms/FormGeneratorNew';
import { useRpcContext } from '@wso2-enterprise/ballerina-rpc-client';
import { URI, Utils } from 'vscode-uri';

export interface ParamProps {
    index: number;
    response: StatusCodeResponse;
    isEdit: boolean;
    schema: StatusCodeResponse;
    onChange: (param: StatusCodeResponse) => void;
    onSave: (param: StatusCodeResponse, index: number) => void;
    onCancel?: (id?: number) => void;
}

export function ResponseEditor(props: ParamProps) {
    const { index, response, isEdit, onSave, onChange, onCancel, schema } = props;

    const { rpcClient } = useRpcContext();

    const [filePath, setFilePath] = useState<string>('');

    useEffect(() => {
        rpcClient.getVisualizerLocation().then(res => { setFilePath(Utils.joinPath(URI.file(res.projectUri), 'main.bal').fsPath) });
    }, []);

    useEffect(() => {
        if (!response.createStatusCodeResponse) {
            response.createStatusCodeResponse = schema.createStatusCodeResponse;
        }
    }, [response]);

    const handleCodeChange = (value: string) => {
        const code = responseCodes.find(code => code.title === value).code;
        response.statusCode.enabled = !!value;
        response.statusCode.value = String(code);
        onChange(response);
    };

    const handleNTypeChange = (value: string, isArray: boolean) => {
        response.type.enabled = !!value;
        response.type.value = isArray ? `${value}[]` : value;
        onChange(response);
    };

    const handleTypeChange = (value: string, isArray: boolean) => {
        response.body.enabled = !!value;
        response.body.value = isArray ? `${value}[]` : value;
        onChange(response);
    };

    const handleNamedTypeChange = (checked: boolean) => {
        response.createStatusCodeResponse.value = checked ? "true" : "false";
        response.createStatusCodeResponse.enabled = checked;
        onChange(response);
    };

    const handleNameValueChange = (value: string) => {
        response.name.value = value;
        response.name.enabled = response.createStatusCodeResponse.enabled;
        onChange(response);
    };

    const handleOnCancel = () => {
        onCancel(index);
    };

    const handleOnSave = () => {
        onSave(response, index);
    };

    const currentFields: FormField[] = [
        {
            key: `code`,
            label: schema.statusCode.metadata.label,
            type: 'SINGLE_SELECT',
            optional: false,
            editable: true,
            documentation: '',
            value: getTitleFromResponseCode(Number(response.statusCode.value)),
            items: responseCodes.map(code => code.title),
            valueTypeConstraint: "",
            addNewButton: false
        },
        {
            key: `typeVal`,
            label: schema.body.metadata.label,
            type: 'TYPE',
            optional: false,
            editable: true,
            documentation: '',
            value: response.body.value,
            valueTypeConstraint: ""
        },
        {
            key: `namedType`,
            label: schema.name.metadata.label,
            type: 'string',
            optional: false,
            advanced: false,
            editable: true,
            documentation: '',
            value: response.name.value,
            valueTypeConstraint: ""
        }
    ];


    const typeField: FormField[] = [
        {
            key: `typeVal`,
            label: schema.type.metadata.label,
            type: 'TYPE',
            optional: false,
            editable: true,
            documentation: '',
            value: response.type.value,
            valueTypeConstraint: ""
        }
    ];

    const onTypeNameSubmit = (dataValues: any) => {
        console.log("Type name values", dataValues);

        const code = responseCodes.find(code => code.title === dataValues.code).code;
        response.statusCode.enabled = !!dataValues.code;
        response.statusCode.value = String(code);

        response.body.enabled = !!dataValues.typeVal;
        response.body.value = dataValues.typeVal;

        response.name.value = dataValues.namedType;
        response.name.enabled = response.createStatusCodeResponse.enabled;
        onSave(response, index);

    }

    const onTypeValueSubmit = (dataValues: any) => {
        response.type.enabled = !!dataValues.typeVal;
        response.type.value = dataValues.typeVal;
        onSave(response, index);
    }

    return (
        <EditorContainer>
            <Typography sx={{ marginBlockEnd: 10 }} variant="h4">Response Configuration</Typography>
            <Divider />
            {!isEdit && filePath &&
                <>
                    <CheckBox
                        label={schema.createStatusCodeResponse?.metadata.description}
                        value={response.createStatusCodeResponse?.metadata.description}
                        checked={response.createStatusCodeResponse?.value === "true"}
                        onChange={handleNamedTypeChange}
                        sx={{ paddingLeft: "16px" }}
                    />
                    <>
                        {response.createStatusCodeResponse?.value === "true" &&
                            <>
                                <FormGeneratorNew
                                    fileName={filePath}
                                    targetLineRange={{ startLine: { line: 0, offset: 0 }, endLine: { line: 0, offset: 0 } }}
                                    fields={currentFields}
                                    onBack={handleOnCancel}
                                    onSubmit={onTypeNameSubmit}
                                    submitText={"Add"}
                                    nestedForm={true}
                                />
                            </>
                        }
                        {(!response.createStatusCodeResponse.value || response.createStatusCodeResponse.value === "false") &&
                            <FormGeneratorNew
                                fileName={filePath}
                                targetLineRange={{ startLine: { line: 0, offset: 0 }, endLine: { line: 0, offset: 0 } }}
                                fields={typeField}
                                onBack={handleOnCancel}
                                onSubmit={onTypeValueSubmit}
                                submitText={"Add"}
                                nestedForm={true}
                            />
                        }
                    </>
                </>
            }
            {isEdit && filePath &&
                <>
                    <FormGeneratorNew
                        fileName={filePath}
                        targetLineRange={{ startLine: { line: 0, offset: 0 }, endLine: { line: 0, offset: 0 } }}
                        fields={typeField}
                        onBack={handleOnCancel}
                        onSubmit={onTypeValueSubmit}
                        submitText={"Save"}
                        nestedForm={true}
                    />
                </>
            }
        </EditorContainer >
    );
}
