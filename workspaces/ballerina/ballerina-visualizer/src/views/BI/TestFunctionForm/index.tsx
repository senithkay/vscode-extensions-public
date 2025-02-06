/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { useEffect, useState } from "react";
import { Typography, View, ViewContent, CompletionItem } from "@wso2-enterprise/ui-toolkit";
import styled from "@emotion/styled";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import { BIHeader } from "../BIHeader";
import { BodyText } from "../../styles";
import { FormField, Form, FormValues, Parameter } from "@wso2-enterprise/ballerina-side-panel";
import { debounce, forEach, set } from "lodash";
import { convertToVisibleTypes } from "../../../utils/bi";
import { URI, Utils } from "vscode-uri";
import { EVENT_TYPE } from "@wso2-enterprise/ballerina-core";

const FormContainer = styled.div`
    display: flex;
    flex-direction: column;
    max-width: 600px;
    gap: 20px;
    margin-top: 20px;
`;

const Container = styled.div`
    display: "flex";
    flex-direction: "column";
    gap: 10;
    margin: 20px;
`;

const ButtonWrapper = styled.div`
    margin-top: 20px;
    width: 130px;
`;

const CardGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    margin-top: 20px;
    width: 100%;
`;

const Link = styled.a`
    cursor: pointer;
    font-size: 12px;
    margin-left: auto;
    margin-right: 15px;
    margin-bottom: -5px;
    color: var(--button-primary-background);
`;

interface TestFunctionDefProps {
    functionName?: string;
    filePath?: string;
    serviceType?: string;
}

interface Metadata {
    label?: string;
    description?: string;
}

interface Codedata {
    lineRange?: LineRange;
}

interface LineRange {
    fileName: string;
    startLine: LinePosition;
    endLine: LinePosition;
}

interface LinePosition {
    line: number;
    offset: number;
}

interface Property {
    metadata?: Metadata;
    codedata?: Codedata;
    valueType?: string;
    valueTypeConstraint?: any;
    originalName?: string;
    value?: any;
    placeholder?: string;
    optional?: boolean;
    editable?: boolean;
    advanced?: boolean;
}

interface FunctionParameter {
    type?: Property;
    variable?: Property;
    defaultValue?: Property;
    optional?: boolean;
    editable?: boolean;
    advanced?: boolean;
}

interface Annotation {
    metadata?: Metadata;
    codedata?: Codedata;
    org?: string;
    module?: string;
    name?: string;
    fields?: Property[];
}

interface TestFunction {
    metadata?: Metadata;
    codedata?: Codedata;
    functionName?: Property;
    returnType?: Property;
    parameters?: FunctionParameter[];
    annotations?: Annotation[];
    editable?: boolean;
}


export function TestFunctionForm(props: TestFunctionDefProps) {
    const { functionName, filePath, serviceType } = props;
    const { rpcClient } = useRpcContext();
    const [filteredTypes, setFilteredTypes] = useState<CompletionItem[]>([]);
    const [types, setTypes] = useState<CompletionItem[]>([]);
    const [formFields, setFormFields] = useState<FormField[]>([]);
    const [testFunction, setTestFunction] = useState<TestFunction>();
    const [formTitle, setFormTitle] = useState<string>('Create New Test Case');

    // <------------- Expression Editor Util functions list start --------------->
    const debouncedGetVisibleTypes = debounce(async (value: string, cursorPosition: number) => {
        let visibleTypes: CompletionItem[] = types;
        if (!types.length) {
            const context = await rpcClient.getVisualizerLocation();
            let functionFilePath = Utils.joinPath(URI.file(context.projectUri), 'functions.bal');
            const workspaceFiles = await rpcClient.getCommonRpcClient().getWorkspaceFiles({});
            const isFilePresent = workspaceFiles.files.some(file => file.path === functionFilePath.fsPath);
            if (!isFilePresent) {
                functionFilePath = Utils.joinPath(URI.file(context.projectUri));
            }

            const response = await rpcClient.getBIDiagramRpcClient().getVisibleTypes({
                filePath: functionFilePath.fsPath,
                position: { line: 0, offset: 0 },
            });

            visibleTypes = convertToVisibleTypes(response.types);
            setTypes(visibleTypes);
        }

        const effectiveText = value.slice(0, cursorPosition);
        const filteredTypes = visibleTypes.filter((type) => {
            const lowerCaseText = effectiveText.toLowerCase();
            const lowerCaseLabel = type.label.toLowerCase();

            return lowerCaseLabel.includes(lowerCaseText);
        });

        setFilteredTypes(filteredTypes);
        return { visibleTypes, filteredTypes };
    }, 250);

    const handleGetVisibleTypes = async (value: string, cursorPosition: number) => {
        return await debouncedGetVisibleTypes(value, cursorPosition) as any;
    };

    const handleCompletionSelect = async () => {
        debouncedGetVisibleTypes.cancel();
        handleExpressionEditorCancel();
    };

    const handleExpressionEditorCancel = () => {
        setFilteredTypes([]);
        setTypes([]);
    };

    const handleExpressionEditorBlur = () => {
        handleExpressionEditorCancel();
    };
    // <------------- Expression Editor Util functions list end --------------->

    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (serviceType === 'UPDATE_TEST') {
            setFormTitle('Update Test Case');
            loadFunction();
        } else {
            setFormTitle('Create New Test Case');
            loadEmptyForm();
        }
    }, [functionName]);

    const loadFunction = async () => {
        setIsLoading(true);
        const res = await rpcClient.getTestManagerRpcClient().getTestFunction({ functionName, filePath });
        console.log("Test Function: ", res);
        setTestFunction(res.function);
        let formFields = generateFormFields(res.function);
        setFormFields(formFields);
        setIsLoading(false);
    }

    const loadEmptyForm = async () => {
        setIsLoading(true);
        const emptyTestFunction = getEmptyTestFunctionModel();
        setTestFunction(emptyTestFunction);
        let formFields = generateFormFields(emptyTestFunction);
        setFormFields(formFields);
        setIsLoading(false);
    }

    const onFormSubmit = async (data: FormValues) => {
        console.log("Test Function Form Data: ", data);
        setIsLoading(true);
        const updatedTestFunction = fillFunctionModel(data);
        console.log("Test Function: ", updatedTestFunction);
        if (serviceType === 'UPDATE_TEST') {
            await rpcClient.getTestManagerRpcClient().updateTestFunction({ function: updatedTestFunction, filePath });
        } else {
            await rpcClient.getTestManagerRpcClient().addTestFunction({ function: updatedTestFunction, filePath });
        }
        const res = await rpcClient.getTestManagerRpcClient().getTestFunction(
            { functionName: updatedTestFunction.functionName.value, filePath });
        const nodePosition = {
            startLine: res.function.codedata.lineRange.startLine.line,
            startColumn: res.function.codedata.lineRange.startLine.offset,
            endLine: res.function.codedata.lineRange.endLine.line,
            endColumn: res.function.codedata.lineRange.endLine.offset
        };
        console.log("Node Position: ", nodePosition);
        await rpcClient.getVisualizerRpcClient().openView(
            { type: EVENT_TYPE.OPEN_VIEW, location: { position: nodePosition, documentUri: filePath } })
        setIsLoading(false);
    };

    // Helper function to modify and set the visual information
    const handleParamChange = (param: Parameter) => {
        const name = `${param.formValues['variable']}`;
        const type = `${param.formValues['type']}`;
        const defaultValue = Object.keys(param.formValues).indexOf('defaultable') > -1 && `${param.formValues['defaultable']}`;
        let value = `${type} ${name}`;
        if (defaultValue) {
            value += ` = ${defaultValue}`;
        }
        return {
            ...param,
            key: name,
            value: value
        }
    };

    const generateFormFields = (testFunction: TestFunction): FormField[] => {
        const fields: FormField[] = [];
        if (testFunction.functionName) {
            fields.push(generateFieldFromProperty('functionName', testFunction.functionName));
        }
        if (testFunction.parameters) {
            fields.push({
                key: `params`,
                label: 'Parameters',
                type: 'PARAM_MANAGER',
                optional: false,
                editable: true,
                advanced: false,
                documentation: '',
                value: '',
                paramManagerProps: {
                    paramValues: generateParamFields(testFunction.parameters),
                    formFields: paramFiels,
                    handleParameter: handleParamChange
                },
                valueTypeConstraint: ""
            });
        }
        if (testFunction.returnType) {
            fields.push(generateFieldFromProperty('returnType', testFunction.returnType));
        }
        if (testFunction.annotations) {
            const configAnnotation = getTestConfigAnnotation(testFunction.annotations);
            if (configAnnotation && configAnnotation.fields) {
                for (const field of configAnnotation.fields) {
                    fields.push(generateFieldFromProperty(field.originalName, field));
                }
            }
        }
        return fields;
    }

    const getTestConfigAnnotation = (annotations: Annotation[]): Annotation | undefined => {
        for (const annotation of annotations) {
            if (annotation.name === 'Config') {
                return annotation;
            }
        }
        return;
    }

    const generateParamFields = (parameters: FunctionParameter[]): Parameter[] => {
        const params: Parameter[] = [];
        let id = 0;
        for (const param of parameters) {
            const key = param.variable.value;
            const type = param.type.value;

            const value = `${type} ${key}`;
            params.push({
                id: id,
                formValues: {
                    variable: key,
                    type: type,
                    defaultable: param.defaultValue ? param.defaultValue.value : ''
                },
                key: key,
                value: value,
                icon: ''
            });

            id++;
        }
        return params
    }

    const generateFieldFromProperty = (key: string, property: Property): FormField => {
        return {
            key: key,
            label: property.metadata.label,
            type: property.valueType,
            optional: property.optional,
            editable: property.editable,
            advanced: property.advanced,
            documentation: property.metadata.description,
            value: property.value,
            valueTypeConstraint: ""
        }
    }

    const fillFunctionModel = (formValues: FormValues): TestFunction => {
        let tmpTestFunction = testFunction;
        if (!tmpTestFunction) {
            tmpTestFunction = {};
        }

        if (formValues['functionName']) {
            tmpTestFunction.functionName.value = formValues['functionName'];
        }

        if (formValues['returnType']) {
            tmpTestFunction.returnType.value = formValues['returnType'];
        }

        if (formValues['params']) {
            const params = formValues['params'];
            const paramList: FunctionParameter[] = [];
            for (const param of params) {
                const variable = param['variable'];
                const type = param['type'];
                const defaultValue = param['defaultable'];
                let emptyParam = getEmptyParamModel();
                emptyParam.variable.value = variable;
                emptyParam.type.value = type;
                emptyParam.defaultValue.value = defaultValue;
                paramList.push(emptyParam);
            }
            tmpTestFunction.parameters = paramList;
        }

        let annots = tmpTestFunction.annotations;
        for (const annot of annots) {
            if (annot.name == 'Config') {
                let configAnnot = annot;
                let fields = configAnnot.fields;
                for (const field of fields) {
                    if (field.originalName == 'groups') {
                        field.value = formValues['groups'];
                    }
                    if (field.originalName == 'enabled') {
                        field.value = formValues['enabled'];
                    }
                }
            }
        }

        return tmpTestFunction;
    }

    const getEmptyParamModel = (): FunctionParameter => {
        return {
            type: {
                valueType: "TYPE",
                value: "string",
                optional: false,
                editable: true,
                advanced: false
            },
            variable: {
                valueType: "IDENTIFIER",
                value: "b",
                optional: false,
                editable: true,
                advanced: false
            },
            defaultValue: {
                valueType: "EXPRESSION",
                value: "\"default\"",
                optional: false,
                editable: true,
                advanced: false
            },
            optional: false,
            editable: true,
            advanced: false
        }

    }

    const getEmptyTestFunctionModel = (): TestFunction => {
        return {
            functionName: {
                metadata: {
                    label: "Test Function",
                    description: "Test function"
                },
                valueType: "IDENTIFIER",
                value: "",
                optional: false,
                editable: true,
                advanced: false
            },
            returnType: {
                metadata: {
                    label: "Return Type",
                    description: "Return type of the function"
                },
                valueType: "TYPE",
                optional: true,
                editable: true,
                advanced: true
            },
            parameters: [],
            annotations: [
                {
                    metadata: {
                        label: "Config",
                        description: "Test Function Configurations"
                    },
                    org: "ballerina",
                    module: "test",
                    name: "Config",
                    fields: [
                        {
                            metadata: {
                                label: "Groups",
                                description: "Groups to run"
                            },
                            valueType: "EXPRESSION_SET",
                            originalName: "groups",
                            value: [],
                            optional: true,
                            editable: true,
                            advanced: false
                        },
                        {
                            metadata: {
                                label: "Enabled",
                                description: "Enable/Disable the test"
                            },
                            valueType: "FLAG",
                            originalName: "enabled",
                            value: true,
                            optional: true,
                            editable: true,
                            advanced: false
                        }
                    ]
                }
            ],
            editable: true
        }
    }

    const paramFiels: FormField[] = [
        {
            key: `variable`,
            label: 'Name',
            type: 'string',
            optional: false,
            editable: true,
            documentation: '',
            value: '',
            valueTypeConstraint: ""
        },
        {
            key: `type`,
            label: 'Type',
            type: 'TYPE',
            optional: false,
            editable: true,
            documentation: '',
            value: '',
            valueTypeConstraint: ""
        },
        {
            key: `defaultable`,
            label: 'Default Value',
            type: 'string',
            optional: true,
            advanced: true,
            editable: true,
            documentation: '',
            value: '',
            valueTypeConstraint: ""
        }
    ];

    return (
        <View>
            <ViewContent padding>
                <BIHeader />
                <Container>
                    <Typography variant="h2">{formTitle}</Typography>
                    <BodyText>
                        Define a test case that can be used within the integration.
                    </BodyText>
                    <FormContainer>
                        <Form
                            formFields={formFields}
                            oneTimeForm={false}
                            expressionEditor={
                                {
                                    types: filteredTypes,
                                    retrieveVisibleTypes: handleGetVisibleTypes,
                                    onCompletionItemSelect: handleCompletionSelect,
                                    onCancel: handleExpressionEditorCancel,
                                    onBlur: handleExpressionEditorBlur
                                }
                            }
                            onSubmit={!isLoading && onFormSubmit}
                        />
                    </FormContainer>
                </Container>
            </ViewContent>
        </View>
    );
}

