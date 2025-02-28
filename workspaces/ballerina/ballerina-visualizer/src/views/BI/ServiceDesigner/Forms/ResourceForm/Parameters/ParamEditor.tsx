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

import { Divider, Dropdown, Typography } from '@wso2-enterprise/ui-toolkit';
import { VSCodeCheckbox } from "@vscode/webview-ui-toolkit/react";
import { EditorContainer } from '../../../styles';
import { LineRange, ParameterModel } from '@wso2-enterprise/ballerina-core';
import { FormField } from '@wso2-enterprise/ballerina-side-panel';
import FormGeneratorNew from '../../../../Forms/FormGeneratorNew';
import { useRpcContext } from '@wso2-enterprise/ballerina-rpc-client';
import { URI, Utils } from 'vscode-uri';

const options = [{ id: "0", value: "QUERY" }, { id: "1", value: "Header" }];

export interface ParamProps {
    param: ParameterModel;
    hideType?: boolean;
    onChange: (param: ParameterModel) => void;
    onSave?: (param: ParameterModel) => void;
    onCancel?: (param?: ParameterModel) => void;
}

export function ParamEditor(props: ParamProps) {
    const { param, hideType = false, onChange, onSave, onCancel } = props;

    const { rpcClient } = useRpcContext();

    const [filePath, setFilePath] = useState<string>('');

    const [targetLineRange, setTargetLineRange] = useState<LineRange>();

    const handleOnSelect = (value: string) => {
        onChange({ ...param, httpParamType: value as "QUERY" | "Header" | "PAYLOAD" });
    };

    const handleTypeChange = (value: string) => {
        onChange({ ...param, type: { ...param.type, value } });
    };

    const handleChange = (value: string) => {
        onChange({ ...param, name: { ...param.name, value } });
    };

    const handleValueChange = (value: string) => {
        onChange({ ...param, defaultValue: { ...param.defaultValue, value } });
    };

    const handleReqFieldChange = () => {
        const kind = param.kind === 'REQUIRED' ? "OPTIONAL" : "REQUIRED";
        onChange({ ...param, kind });
    };

    const handleOnCancel = () => {
        onCancel(param);
    };

    const handleOnSave = () => {
        onSave(param);
    };

    useEffect(() => {
        rpcClient.getVisualizerLocation().then(res => { setFilePath(Utils.joinPath(URI.file(res.projectUri), 'main.bal').fsPath) });
    }, []);


    const currentFields: FormField[] = [
        {
            key: `variable`,
            label: 'Name',
            type: 'string',
            optional: false,
            editable: true,
            documentation: '',
            value: param.name.value,
            valueTypeConstraint: ""
        }
    ];

    !hideType && currentFields.push({
        key: `type`,
        label: 'Type',
        type: 'TYPE',
        optional: false,
        editable: true,
        documentation: '',
        value: param.type.value,
        valueTypeConstraint: ""
    })

    param.defaultValue && currentFields.push({
        key: `defaultable`,
        label: 'Default Value',
        type: 'string',
        optional: true,
        advanced: true,
        editable: true,
        documentation: '',
        value: param.defaultValue?.value,
        valueTypeConstraint: ""
    })

    const onParameterSubmit = (dataValues: any) => {
        console.log("Param values", dataValues);
        onSave({
            ...param,
            type: { ...param.type, value: dataValues['type'] },
            name: { ...param.name, value: dataValues['variable'] },
            defaultValue: { ...param.defaultValue, value: dataValues['defaultable'] }
        });
    }

    useEffect(() => {
        if (filePath && rpcClient) {
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

    return (
        <EditorContainer>
            {param.httpParamType && <Typography sx={{ marginBlockEnd: 10 }} variant="h4">{param.httpParamType === "PAYLOAD" ? "Payload" : "Parameter"} Configuration</Typography>}
            {!param.httpParamType && <Typography sx={{ marginBlockEnd: 10 }} variant="h4">{param.metadata.label} Configuration</Typography>}
            <Divider />
            {param.httpParamType && param.httpParamType !== "PAYLOAD" && (
                <Dropdown
                    id="param-type-selector"
                    sx={{ zIndex: 2, width: 172 }}
                    isRequired
                    items={options}
                    label="Param Type"
                    onValueChange={handleOnSelect}
                    value={param.httpParamType}
                />
            )}
            <>
                {filePath && targetLineRange &&
                    <FormGeneratorNew
                        fileName={filePath}
                        targetLineRange={targetLineRange}
                        fields={currentFields}
                        onBack={handleOnCancel}
                        onSubmit={onParameterSubmit}
                        submitText={param.type.value ? "Save" : "Add"}
                        nestedForm={true}
                    />
                }

            </>
            {param.httpParamType === "QUERY" && (
                <VSCodeCheckbox checked={param.kind === "REQUIRED"} onChange={handleReqFieldChange} id="is-req-checkbox">
                    Is Required?
                </VSCodeCheckbox>
            )}
        </EditorContainer >
    );
}
