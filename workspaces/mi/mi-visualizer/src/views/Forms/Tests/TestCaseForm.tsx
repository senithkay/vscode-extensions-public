/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { yupResolver } from "@hookform/resolvers/yup";
import { EVENT_TYPE, MACHINE_VIEW } from "@wso2-enterprise/mi-core";
import { ParamManager, ParamValue, getParamManagerFromValues, getParamManagerValues } from "@wso2-enterprise/mi-diagram";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import { Button, ComponentCard, Dropdown, FormActions, FormView, TextArea, TextField, Typography } from "@wso2-enterprise/ui-toolkit";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { TagRange } from '@wso2-enterprise/mi-syntax-tree/lib/src';
import * as yup from "yup";
import { getTestCaseXML } from "../../../utils/template-engine/mustache-templates/TestSuite";

interface TestCaseFormProps {
    filePath?: string;
    range?: TagRange;
    testCase?: TestCaseEntry;
    availableTestCases?: string[];
    onGoBack?: () => void;
    onSubmit?: (values: any) => void;
}

export interface TestCaseEntry {
    name: string;
    assertions?: string[][];
    input: TestCaseInput;
    inputProperties?: string[][];
    range?: TagRange;
}

export interface TestCaseInput {
    requestPath: string;
    requestMethod: string;
    requestProtocol: string;
    payload?: string;
}

const cardStyle = {
    display: "block",
    margin: "15px 0",
    padding: "0 15px 15px 15px",
    width: "auto",
    cursor: "auto"
};

export function TestCaseForm(props: TestCaseFormProps) {
    const { rpcClient } = useVisualizerContext();

    const [isLoaded, setIsLoaded] = useState(false);
    const requestMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS', 'TRACE', 'CONNECT'];
    const requestProtocols = ['HTTP', 'HTTPS'];
    const isUpdate = !!props.testCase;
    const availableTestCases = props.availableTestCases || [];

    // Schema
    const schema = yup.object({
        name: yup.string().required("Test case name is required").matches(/^[a-zA-Z0-9_-]*$/, "Invalid characters in test case name")
            .notOneOf(availableTestCases, "Test case name already exists"),
        input: yup.object({
            requestPath: yup.string().required("Resource path is required"),
            requestMethod: yup.string().oneOf(requestMethods).required("Resource method is required"),
            requestProtocol: yup.string().oneOf(requestProtocols).required("Resource type is required"),
            payload: yup.string(),
        }),
        inputProperties: yup.mixed(),
        assertions: yup.mixed(),
    });

    const {
        control,
        handleSubmit,
        formState: { errors },
        register,
        reset
    } = useForm({
        resolver: yupResolver(schema),
        mode: "onChange",
    });

    useEffect(() => {
        (async () => {
            const inputPropertiesFields = [
                {
                    "type": "TextField",
                    "label": "Property Name",
                    "defaultValue": "",
                    "isRequired": true
                },
                {
                    "type": "TextField",
                    "label": "Property Value",
                    "defaultValue": "",
                    "isRequired": true
                }
            ];

            const assertionsFields = [
                {
                    type: "Dropdown",
                    label: "Assertion Type",
                    defaultValue: "Assert Equals",
                    isRequired: false,
                    values: ["Assert Equals", "Assert Not Null"]
                },
                {
                    "type": "TextField",
                    "label": "Actual Expression",
                    "defaultValue": "",
                    "isRequired": true
                },
                {
                    "type": "TextArea",
                    "label": "Expected Value",
                    "defaultValue": "",
                    "isRequired": true,
                    "enableCondition": [
                        { 0: "Assert Equals" }
                    ]
                },
                {
                    "type": "TextField",
                    "label": "Error Message",
                    "defaultValue": "",
                    "isRequired": true,
                }
            ];

            if (isUpdate) {
                if (props?.testCase?.input?.payload?.startsWith("<![CDATA[")) {
                    props.testCase.input.payload = props.testCase.input.payload.substring(9, props.testCase.input.payload.length - 3);
                }
                if (props?.testCase?.assertions) {
                    props.testCase.assertions = props.testCase.assertions.map((assertion: string[]) => {
                        if (assertion[2].startsWith("<![CDATA[")) {
                            assertion[2] = assertion[2].substring(9, assertion[2].length - 3);
                        }
                        return assertion;
                    });
                }
                reset({
                    ...props.testCase,
                    inputProperties: {
                        paramValues: props.testCase.inputProperties ? getParamManagerFromValues(props.testCase.inputProperties) : [],
                        paramFields: inputPropertiesFields
                    },
                    assertions: {
                        paramValues: props.testCase.assertions ? getParamManagerFromValues(props.testCase.assertions, 0) : [],
                        paramFields: assertionsFields
                    },
                });
                setIsLoaded(true);
                return;
            }

            reset({
                input: {
                    requestPath: "/",
                    requestMethod: "GET",
                    requestProtocol: "HTTP",
                },
                inputProperties: {
                    paramValues: [],
                    paramFields: inputPropertiesFields
                },
                assertions: {
                    paramValues: [],
                    paramFields: assertionsFields
                },
            });
            setIsLoaded(true);
        })();
    }, []);

    const handleGoBack = () => {
        if (props.onGoBack) {
            props.onGoBack();
            return;
        }
        rpcClient.getMiVisualizerRpcClient().goBack();
    }

    const openOverview = () => {
        rpcClient.getMiVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { view: MACHINE_VIEW.Overview } });
    };

    const submitForm = async (values: any) => {
        values.inputProperties = getParamManagerValues(values.inputProperties);
        values.assertions = getParamManagerValues(values.assertions);

        if (props.onSubmit) {
            delete values.filePath;
            props.onSubmit(values);
            return;
        }
        const content = getTestCaseXML(values);
        rpcClient.getMiDiagramRpcClient().updateTestCase({ path: props.filePath, content, range: props.range }).then(() => {
            openOverview();
        });
    }

    if (!isLoaded) {
        return <div>Loading...</div>
    }

    return (
        <FormView title={`${isUpdate ? "Update" : "Create New"} Test Case`} onClose={handleGoBack}>
            <TextField
                id="name"
                label="Name"
                placeholder="Test case name"
                required
                errorMsg={errors.name?.message.toString()}
                {...register("name")}
            />
            <TextField
                id="requestPath"
                label="Resource path"
                placeholder="/"
                required
                errorMsg={errors.input?.requestPath?.message.toString()}
                {...register("input.requestPath")}
            />
            <Dropdown
                id="requestMethod"
                label="Resource method"
                items={requestMethods.map((method) => ({ value: method, content: method }))}
                errorMsg={errors.input?.requestMethod?.message.toString()}
                {...register('input.requestMethod')} />
            <Dropdown
                id="requestProtocol"
                label="Resource Protocol"
                items={requestProtocols.map((method) => ({ value: method, content: method }))}
                errorMsg={errors.input?.requestProtocol?.message.toString()}
                {...register('input.requestProtocol')} />
            <TextArea
                id="payload"
                label="Input Payload"
                placeholder="Input payload"
                rows={5}
                {...register("input.payload")}
            />

            <ComponentCard sx={cardStyle} disbaleHoverEffect>
                <Typography variant="h3">Properties</Typography>
                <Typography variant="body3">Editing of the properties of an input</Typography>

                <Controller
                    name="inputProperties"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                        <ParamManager
                            paramConfigs={value}
                            readonly={false}
                            addParamText="Add Property"
                            onChange={(values) => {
                                values.paramValues = values.paramValues.map((param: any) => {
                                    const property: ParamValue[] = param.paramValues;
                                    param.key = property[0].value;
                                    param.value = property[1].value;
                                    param.icon = 'query';
                                    return param;
                                });
                                onChange(values);
                            }}
                        />
                    )}
                />

            </ComponentCard>

            <ComponentCard sx={cardStyle} disbaleHoverEffect>
                <Typography variant="h3">Assertions</Typography>
                <Typography variant="body3">Editing of the properties of an assertion</Typography>

                <Controller
                    name="assertions"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                        <ParamManager
                            paramConfigs={value}
                            readonly={false}
                            addParamText="Add Assertion"
                            onChange={(values) => {
                                values.paramValues = values.paramValues.map((param: any) => {
                                    const property: ParamValue[] = param.paramValues;
                                    param.key = property[0].value;
                                    param.value = property[1].value;
                                    param.icon = 'query';
                                    return param;
                                });
                                onChange(values);
                            }}
                        />
                    )}
                />

            </ComponentCard>

            <FormActions>
                <Button
                    appearance="primary"
                    onClick={handleSubmit(submitForm)}
                >
                    {`${isUpdate ? "Update" : "Create"}`}
                </Button>
                <Button appearance="secondary" onClick={handleGoBack}>
                    Cancel
                </Button>
            </FormActions>
        </FormView>
    );
}
