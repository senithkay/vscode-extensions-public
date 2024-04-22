/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from "react";

import { useForm, Controller } from 'react-hook-form';
import { ExpressionFieldValue, TextField } from '@wso2-enterprise/ui-toolkit';
import { ActionButtons, ParamManager } from '@wso2-enterprise/ui-toolkit';
import SidePanelContext from "../SidePanelContexProvider";

export interface Namespace {
    prefix: string;
    uri: string;
}

const ExpressionEditor = () => {
    const sidePanelContext = React.useContext(SidePanelContext);
    const data: ExpressionFieldValue = sidePanelContext?.expressionEditor?.value;

    const { control, handleSubmit } = useForm({
        defaultValues: {
            expressionValue: data.value,
            namespaces: {
                paramValues: data?.namespaces && data.namespaces.map((namespace: Namespace, index: number) => (
                    {
                        id: index,
                        key: namespace.prefix,
                        value: namespace.uri,
                        icon: 'query',
                        paramValues: [
                            { value: namespace.prefix },
                            { value: namespace.uri },
                        ]
                    }
                )) || [],
                paramFields: [
                    {
                        "type": "TextField" as "TextField",
                        "label": "Prefix",
                        "defaultValue": "",
                        "isRequired": false,
                        "canChange": false
                    },
                    {
                        "type": "TextField" as "TextField",
                        "label": "URI",
                        "defaultValue": "",
                        "isRequired": false,
                        "canChange": false
                    },
                ]
            },
        }
    });

    const onSubmit = (data: any) => {
        data.namespaces = data.namespaces.paramValues.map((param: any) => { return { 'prefix': param.key, 'uri': param.value } });

        sidePanelContext.setSidePanelState({
            ...sidePanelContext,
            expressionEditor: {
                isOpen: false,
                value: {
                    expressionValue: data.expressionValue,
                    namespaces: data.namespaces,
                }
            }
        });

        sidePanelContext.expressionEditor.setValue({
            isExpression: true,
            value: data.expressionValue,
            namespaces: data.namespaces,
        });
    };

    const handleOnCancel = () => {
        sidePanelContext.setSidePanelState({
            ...sidePanelContext,
            expressionEditor: {
                ...sidePanelContext.expressionEditor,
                isOpen: false,
            }
        });
    }

    return (
        <div style={{ padding: "25px" }}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div>
                    <Controller
                        name="expressionValue"
                        control={control}
                        render={({ field }) => (
                            <TextField {...field} label="Expression Value" size={50} placeholder="Expression Value" />
                        )}
                    />
                </div>
                <div>
                    <Controller
                        name="namespaces"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                            <ParamManager
                                paramConfigs={value}
                                readonly={false}
                                onChange={(values) => {
                                    values.paramValues = values.paramValues.map((param: any) => {
                                        const paramValues = param.paramValues;
                                        param.key = paramValues[0].value;
                                        param.value = paramValues[1].value;
                                        param.icon = 'query';
                                        return param;
                                    });
                                    onChange(values);
                                }}
                            />
                        )}
                    />
                </div>
                <ActionButtons
                    primaryButton={{ text: "Save", onClick: handleSubmit(onSubmit) }}
                    secondaryButton={{ text: "Cancel", onClick: handleOnCancel }}
                    sx={{ justifyContent: "flex-end" }}
                />
            </form >
        </div >
    );
};

export default ExpressionEditor;