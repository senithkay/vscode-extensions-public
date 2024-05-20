/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useState } from 'react';
import { AutoComplete, Button, ComponentCard, RequiredFormInput, TextField } from '@wso2-enterprise/ui-toolkit';
import { VSCodeDropdown, VSCodeOption } from '@vscode/webview-ui-toolkit/react';
import styled from '@emotion/styled';
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';
import SidePanelContext from '../SidePanelContexProvider';
import { create } from 'xmlbuilder2';
import { Range } from '@wso2-enterprise/mi-syntax-tree/lib/src';
import { ExpressionField, ExpressionFieldValue } from '../../Form/ExpressionField/ExpressionInput';

const cardStyle = {
    display: "block",
    margin: "5px 0",
    padding: "10px 15px 15px 15px",
    width: "auto",
    cursor: "auto"
};

const Error = styled.span`
    color: var(--vscode-errorForeground);
    font-size: 12px;
`;

interface AddConnectionProps {
    nodePosition: Range;
    documentUri: string;
    onNewConnection: (connectionName: string) => void;
    cancelConnection: () => void;
    allowedConnectionTypes: string[];
    connectorName: string;
}

interface Element {
    inputType: any;
    name: string | number;
    displayName: any;
    required: string;
    helpTip: any;
    comboValues?: any[];
    allowedConnectionTypes?: string[];
}

const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
const nameWithoutSpecialCharactorsRegex = /^[a-zA-Z0-9]+$/g;

const AddConnection = (props: AddConnectionProps) => {
    const { allowedConnectionTypes, documentUri, onNewConnection, cancelConnection } = props;
    const { rpcClient } = useVisualizerContext();

    const sidePanelContext = React.useContext(SidePanelContext);
    const [formValues, setFormValues] = useState({} as any);
    const [errors, setErrors] = useState({} as any);
    const [connectionType, setConnectionType] = useState(allowedConnectionTypes[0]);
    const [formData, setFormData] = useState({} as any);

    const formValidators: { [key: string]: (e?: any) => string | undefined } = {};

    useEffect(() => {
        const fetchFormData = async () => {
            if (connectionType) {
                const connectorData = await rpcClient.getMiDiagramRpcClient().getAvailableConnectors({
                    documentUri: props.documentUri,
                    connectorName: props.connectorName
                });

                const connectionUiSchema = connectorData.connectionUiSchema[connectionType as any];

                const connectionFormJSON = await rpcClient.getMiDiagramRpcClient().getConnectionForm({ uiSchemaPath: connectionUiSchema });

                setFormData(connectionFormJSON.formJSON);
            }
        };

        fetchFormData();
    }, [connectionType]);

    useEffect(() => {
        if (sidePanelContext.formValues && Object.keys(sidePanelContext.formValues).length > 0 && sidePanelContext.formValues?.parameters) {
            const parametersValues = sidePanelContext.formValues?.parameters?.map((param: any) => {
                const validationError = formValidators[param.name]?.(param.value);
                return {
                    [param.name]: {
                        "isExpression": param.isExpression ?? false,
                        "value": param.isExpression ? param.value.replace(/[{}]/g, '') : param.value ?? '',
                        "namespaces": param.namespaces ?? [],
                        "error": validationError
                    }
                };
            });
            const flattenedParameters = Object.assign({}, ...parametersValues);
            setFormValues({ ...formValues, ...flattenedParameters });
        }
    }, [sidePanelContext.formValues]);

    const validateField = (id: string, e: any, isRequired: boolean, validation?: "e-mail" | "nameWithoutSpecialCharactors" | "custom", regex?: string): string => {
        const value = e ?? formValues[id];
        const newErrors = { ...errors };
        let error;
        if (isRequired && !value) {
            error = "This field is required";
        } else if (validation === "e-mail" && !value.match(emailRegex)) {
            error = "Invalid e-mail address";
        } else if (validation === "nameWithoutSpecialCharactors" && !value.match(nameWithoutSpecialCharactorsRegex)) {
            error = "Invalid name";
        } else if (validation === "custom" && !value.match(regex)) {
            error = "Invalid input";
        } else {
            delete newErrors[id];
            setErrors(newErrors);
        }
        setErrors({ ...errors, [id]: error });
        return error;
    };

    const onAddConnection = async () => {
        const newErrors = {} as any;
        Object.keys(formValidators).forEach((key) => {
            const error = formValidators[key]();
            if (error) {
                newErrors[key] = (error);
            }
        });
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
        } else {
            const template = create();
            const root = template.ele(`${formData.connectorName}.init`);
            root.ele('connectionType').txt(connectionType);
            // Fill the values
            Object.keys(formValues).forEach((key) => {
                if (key !== 'configRef' && formValues[key].value) {
                    if (typeof formValues[key] === 'object' && formValues[key] !== null) {
                        // Handle expression input type
                        const namespaces = formValues[key].namespaces;
                        const value = formValues[key].value;
                        const isExpression = formValues[key].isExpression;
                        key = (key === 'connectionName') ? 'name' : key;

                        if (isExpression) {
                            if (namespaces && namespaces.length > 0) {
                                // Generate XML with namespaces
                                const element = root.ele(key);
                                namespaces.forEach((namespace: any) => {
                                    element.att(`xmlns:${namespace.prefix}`, namespace.uri);
                                });
                                element.txt(`{${value}}`);
                            } else{
                                root.ele(key).txt(`{${value}}`);
                            }
                        } else {
                            root.ele(key).txt(value);
                        }
                    } else {
                        root.ele(key).txt(formValues[key]);
                    }
                }
            });
            const modifiedXml = template.end({ prettyPrint: true, headless: true });

            const visualizerState = await rpcClient.getVisualizerState();
            const projectUri = visualizerState.projectUri;
            const sep = visualizerState.pathSeparator;
            const localEntryPath = [projectUri, 'src', 'main', 'wso2mi', 'artifacts', 'local-entries'].join(sep);

            const connectionName = await rpcClient.getMiDiagramRpcClient().createConnection({
                connectionName: formValues['connectionName'].value,
                keyValuesXML: modifiedXml,
                directory: localEntryPath
            });

            onNewConnection(connectionName.name);
        }
    };

    const renderFormElement = (element: Element) => {
        switch (element.inputType) {
            case 'string':
                return (
                    <TextField
                        label={element.displayName}
                        size={50}
                        value={formValues[element.name]?.value || ''}
                        onTextChange={(e: any) => {
                            setFormValues({ ...formValues, [element.name]: { value: e } });
                            formValidators[element.name](e);
                        }}
                        required={element.required === 'true'}
                        placeholder={element.helpTip}
                    />
                );
            case 'stringOrExpression':
                return (
                    <ExpressionField
                        label={element.displayName}
                        placeholder={element.helpTip}
                        required={element.required === 'true'}
                        value={{
                            "isExpression": formValues[element.name]?.isExpression ?? false,
                            "value": formValues[element.name]?.value ?? '',
                            "namespaces": formValues[element.name]?.namespaces ?? []
                        }}
                        canChange={true}
                        onChange={(e: any) => {
                            setFormValues({ ...formValues, [element.name]: e });
                            formValidators[element.name](e.value);
                        }}
                        openExpressionEditor={(value: ExpressionFieldValue, setValue: any) => {
                            sidePanelContext.setSidePanelState({
                                ...sidePanelContext,
                                expressionEditor: {
                                    isOpen: true,
                                    value,
                                    setValue
                                }
                            });
                        }}
                    />
                );
            case 'stringOrExpresion':
                return (
                    <ExpressionField
                        label={element.displayName}
                        placeholder={element.helpTip}
                        required={element.required === 'true'}
                        value={{
                            "isExpression": formValues[element.name]?.isExpression ?? false,
                            "value": formValues[element.name]?.value ?? '',
                            "namespaces": formValues[element.name]?.namespaces ?? []
                        }}
                        canChange={true}
                        onChange={(e: any) => {
                            setFormValues({ ...formValues, [element.name]: e });
                            formValidators[element.name](e.value);
                        }}
                        openExpressionEditor={(value: ExpressionFieldValue, setValue: any) => {
                            sidePanelContext.setSidePanelState({
                                ...sidePanelContext,
                                expressionEditor: {
                                    isOpen: true,
                                    value,
                                    setValue
                                }
                            });
                        }}
                    />
                );
            case 'booleanOrExpression':
                return (
                    <>
                        <label>{element.displayName}</label> {element.required === "true" && <RequiredFormInput />}
                        <AutoComplete
                            identifier={element.displayName}
                            items={["true", "false"]}
                            value={formValues[element.name]?.value}
                            onValueChange={(e: any) => {
                                setFormValues({ ...formValues, [element.name]: { value: e } });
                                formValidators[element.name](e);
                            }}
                            allowItemCreate={true}
                            required={element.required === 'true'} />
                    </>
                );
            case 'comboOrExpression':
                return (
                    <>
                        <label>{element.displayName}</label> {element.required && <RequiredFormInput />}
                        <AutoComplete
                            identifier={element.displayName}
                            items={element.comboValues}
                            value={formValues[element.name]?.value}
                            onValueChange={(e: any) => {
                                setFormValues({ ...formValues, [element.name]: { value: e } });
                                formValidators[element.name](e);
                            }}
                            allowItemCreate={true}
                            required={element.required === 'true'} />
                    </>

                );
            case 'textAreaOrExpression':
                return (
                    <TextField
                        label={element.displayName}
                        size={50}
                        value={formValues[element.name]?.value || ''}
                        onTextChange={(e: any) => {
                            setFormValues({ ...formValues, [element.name]: { value: e } });
                            formValidators[element.name](e);
                        }}
                        required={element.required === 'true'}
                        placeholder={element.helpTip}
                    />
                );
            case 'integerOrExpression':
                return (
                    <ExpressionField
                        label={element.displayName}
                        placeholder={element.helpTip}
                        value={{
                            "isExpression": false,
                            "value": formValues[element.name]?.value ?? '',
                            "namespaces": formValues[element.name]?.namespaces ?? []
                        }}
                        canChange={true}
                        onChange={(e: any) => {
                            setFormValues({ ...formValues, [element.name]: e });
                            formValidators[element.name](e.value);
                        }}
                        openExpressionEditor={(value: ExpressionFieldValue, setValue: any) => {
                            sidePanelContext.setSidePanelState({
                                ...sidePanelContext,
                                expressionEditor: {
                                    isOpen: true,
                                    value,
                                    setValue
                                }
                            });
                        }}
                    />
                );
            case 'connection':
                formValues[element.name] = formValues[element.name]?.value ?? element.allowedConnectionTypes[0];
                return (<>
                    <label>{element.displayName}</label> {element.required && <RequiredFormInput />}
                    <div style={{ display: "flex", flexDirection: "row", width: '100%', gap: '10px' }}>
                        <VSCodeDropdown
                            label={element.displayName}
                            value={formValues[element.name]}
                            autoWidth={true}
                            onChange={(e: any) => {
                                setFormValues({ ...formValues, [element.name]: e.target.value });
                                formValidators[element.name](e);
                            }}
                            style={{ color: 'var(--vscode-editor-foreground)', width: '90%' }}
                        >
                            {
                                element.allowedConnectionTypes.map((value: string) => (
                                    <VSCodeOption
                                        style={{
                                            color: 'var(--vscode-editor-foreground)',
                                            background: 'var(--vscode-editor-background)'
                                        }}>{value}
                                    </VSCodeOption>
                                ))
                            }
                        </VSCodeDropdown>
                    </div>
                </>);
            default:
                return null;
        }
    };

    const renderForm: any = (elements: any[]) => {
        return elements.map((element: { type: string; value: any; }) => {
            if (element.type === 'attribute') {
                formValidators[element.value.name] = (e?: any) => validateField(element.value.name, e, element.value.required === 'true', element.value.validation, element.value.regex);
                return <>
                    {renderFormElement(element.value)}
                    {errors[element.value.name] && <Error>{errors[element.value.name]}</Error>}
                </>;
            } else if (element.type === 'attributeGroup') {
                return (
                    <>
                        {element.value.groupName === "General" ? renderForm(element.value.elements) :
                            <>
                                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                                    <h3 style={{ margin: '0 0 15px 0' }}>{element.value.groupName}</h3>
                                    {renderForm(element.value.elements)}
                                </ComponentCard>
                            </>
                        }
                    </>
                );
            }
            return null;
        });
    };

    return (
        <>
            <div style={{ padding: "10px" }}>
                <label>{"Connection Type"}</label> {<RequiredFormInput />}
                <VSCodeDropdown
                    label={"Connection Type"}
                    value={connectionType}
                    autoWidth={true}
                    onChange={(e: any) => {
                        setConnectionType(e.target.value);
                    }}
                    style={{ color: 'var(--vscode-editor-foreground)', width: '100%' }}
                >
                    {
                        allowedConnectionTypes.map((value: string) => (
                            <VSCodeOption
                                style={{
                                    color: 'var(--vscode-editor-foreground)',
                                    background: 'var(--vscode-editor-background)'
                                }}>{value}
                            </VSCodeOption>
                        ))
                    }
                </VSCodeDropdown>
                {formData && formData.elements && formData.elements.length > 0 && (
                    <>
                        {renderForm(formData.elements)}
                        <div style={{ display: "flex", textAlign: "right", justifyContent: "flex-end", marginTop: "10px", gap: "10px" }}>
                            <Button
                                appearance="secondary"
                                onClick={cancelConnection}
                            >
                                Cancel
                            </Button>
                            <Button
                                appearance="primary"
                                onClick={onAddConnection}
                            >
                                Add
                            </Button>
                        </div>
                    </>
                )}

            </div >
        </>
    );
};

export default AddConnection;
