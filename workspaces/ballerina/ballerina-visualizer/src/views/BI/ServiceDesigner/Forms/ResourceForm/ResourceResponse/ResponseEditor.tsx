/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: jsx-no-multiline-js

import { useEffect, useState } from 'react';

import { CheckBox, Divider, Tabs, Typography } from '@wso2-enterprise/ui-toolkit';
import { EditorContainer, EditorContent } from '../../../styles';
import { LineRange, PropertyModel, StatusCodeResponse, responseCodes } from '@wso2-enterprise/ballerina-core';
import { getTitleFromResponseCode } from '../../../utils';
import { FormField, FormValues } from '@wso2-enterprise/ballerina-side-panel';
import FormGeneratorNew from '../../../../Forms/FormGeneratorNew';
import { useRpcContext } from '@wso2-enterprise/ballerina-rpc-client';
import { URI, Utils } from 'vscode-uri';
import { VSCodeCheckbox } from '@vscode/webview-ui-toolkit/react';


enum Views {
    NEW = "NEW",
    EXISTING = "EXISTING",
}

export interface ParamProps {
    index: number;
    response: StatusCodeResponse;
    isEdit: boolean;
    onSave: (param: StatusCodeResponse, index: number) => void;
    onCancel?: (id?: number) => void;
}

export function ResponseEditor(props: ParamProps) {
    const { index, response, isEdit, onSave, onCancel } = props;

    const { rpcClient } = useRpcContext();

    const [filePath, setFilePath] = useState<string>('');
    const [currentView, setCurrentView] = useState(response.type.value ? Views.EXISTING : Views.NEW);

    const [targetLineRange, setTargetLineRange] = useState<LineRange>();

    useEffect(() => {
        rpcClient.getVisualizerLocation().then(res => { setFilePath(Utils.joinPath(URI.file(res.projectUri), 'main.bal').fsPath) });
    }, []);

    const handleOnCancel = () => {
        onCancel(index);
    };

    const convertPropertyToFormField = (property: PropertyModel) => {
        const converted: FormField = {
            key: "",
            label: property.metadata.label,
            type: property.valueType,
            optional: property.optional,
            editable: property.editable,
            enabled: property.enabled,
            documentation: property.metadata.description,
            value: property.value,
            items: property.items,
            valueTypeConstraint: property.valueTypeConstraint,
        }
        return converted;
    }

    const newFields: FormField[] = [
        {
            ...convertPropertyToFormField(response.statusCode),
            key: `statusCode`,
            value: getTitleFromResponseCode(Number(response.statusCode.value)),
            items: responseCodes.map(code => code.title),
        },
        {
            ...convertPropertyToFormField(response.body),
            key: `body`,
        },
        {
            ...convertPropertyToFormField(response.name),
            key: `name`,
        },
        {
            ...convertPropertyToFormField(response.headers),
            key: `headers`,
        }
    ];


    const existingFields: FormField[] = [
        {
            ...convertPropertyToFormField(response.type),
            key: `type`,
        }
    ];

    const handleOnNewSubmit = (dataValues: FormValues) => {
        console.log("Add New Response: ", dataValues);
        // Set the values
        const code = responseCodes.find(code => code.title === dataValues['statusCode']).code;
        response.statusCode.value = String(code);
        response.body.value = dataValues['body'];
        response.name.value = dataValues['name'];
        response.headers.values = dataValues['headers'];
        onSave(response, index);
    }

    const handleOnExistingSubmit = (dataValues: FormValues) => {
        console.log("Add Existing Type: ", dataValues);
        response.type.value = dataValues['type'];
        response.statusCode.value = '';
        response.body.value = '';
        response.name.value = '';
        response.headers.values = [];
        onSave(response, index);
    }

    useEffect(() => {
        if (rpcClient) {
            rpcClient
                .getBIDiagramRpcClient()
                .getEndOfFile({ filePath })
                .then((res) => {
                    setTargetLineRange({
                        startLine: res,
                        endLine: res,
                    });
                });
        }
    }, [filePath, rpcClient]);

    const handleViewChange = (view: string) => {
        setCurrentView(view as Views);
    };

    const handleCheckChange = (view: string) => {
        if (currentView === Views.EXISTING) {
            setCurrentView(Views.NEW);
        } else {
            setCurrentView(Views.EXISTING);
        }
    };

    return (
        <EditorContainer>
            <EditorContent>
                <Typography sx={{ marginBlockEnd: 10 }} variant="h4">Response Configuration</Typography>
                <VSCodeCheckbox checked={currentView === Views.EXISTING} onChange={handleCheckChange} id="is-req-checkbox">
                    Use Existing
                </VSCodeCheckbox>
            </EditorContent>
            <Divider />
            {currentView === Views.NEW && filePath && targetLineRange &&
                <div>
                    <FormGeneratorNew
                        fileName={filePath}
                        targetLineRange={targetLineRange}
                        fields={newFields}
                        onBack={handleOnCancel}
                        onSubmit={handleOnNewSubmit}
                        submitText={isEdit ? "Save" : "Add"}
                        nestedForm={true}
                        helperPaneSide='left'
                    />
                </div>}
            {currentView === Views.EXISTING && filePath && targetLineRange &&
                <div>
                    <FormGeneratorNew
                        fileName={filePath}
                        targetLineRange={targetLineRange}
                        fields={existingFields}
                        onBack={handleOnCancel}
                        onSubmit={handleOnExistingSubmit}
                        submitText={isEdit ? "Save" : "Add"}
                        nestedForm={true}
                        helperPaneSide='left'
                    />
                </div>
            }
        </EditorContainer >
    );
}
