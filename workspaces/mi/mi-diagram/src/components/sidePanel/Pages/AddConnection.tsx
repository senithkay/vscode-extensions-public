/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useRef, useState } from 'react';
import { AutoComplete, Button, ComponentCard, RequiredFormInput, TextField } from '@wso2-enterprise/ui-toolkit';
import { VSCodeDropdown, VSCodeOption } from '@vscode/webview-ui-toolkit/react';
import styled from '@emotion/styled';
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';
import SidePanelContext from '../SidePanelContexProvider';
import { create } from 'xmlbuilder2';
import { Range } from '@wso2-enterprise/mi-syntax-tree/lib/src';
import { ExpressionField, ExpressionFieldValue } from '../../Form/ExpressionField/ExpressionInput';
import { useForm, Controller } from 'react-hook-form';
import { handleOpenExprEditor, sidepanelAddPage, sidepanelGoBack } from '..';

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

const Field = styled.div`
   margin-bottom: 5px;
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
    defaultValue?: any;
    allowedConnectionTypes?: string[];
}

const AddConnection = (props: AddConnectionProps) => {
    const { allowedConnectionTypes, documentUri, onNewConnection, cancelConnection } = props;
    const { rpcClient } = useVisualizerContext();

    const sidePanelContext = React.useContext(SidePanelContext);
    const [errors, setErrors] = useState({} as any);
    const [connectionType, setConnectionType] = useState(allowedConnectionTypes[0]);
    const [formData, setFormData] = useState({} as any);
    const handleOnCancelExprEditorRef = useRef(() => { });
    const formValidators: { [key: string]: (e?: any) => string | undefined } = {};
    const { control, handleSubmit, watch, getValues } = useForm();

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
        handleOnCancelExprEditorRef.current = () => {
            sidepanelGoBack(sidePanelContext);
        };
    }, [sidePanelContext.pageStack]);

    const validateField = (id: string, e: any, isRequired: boolean, validation?: "e-mail" | "nameWithoutSpecialCharactors" | "custom", regex?: string): string => {
        let value = e ?? getValues(id);
        if (typeof value === 'object') {
            value = value.value;
        }

        const newErrors = { ...errors };
        let error;
        if (isRequired && !value) {
            error = "This field is required";
        } else {
            delete newErrors[id];
            setErrors(newErrors);
        }
        setErrors({ ...errors, [id]: error });
        return error;
    };

    const onAddConnection = async (values: any) => {

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

            if (errors && Object.keys(errors).length > 0) {
                console.log("have errors");
            }

            // Fill the values
            Object.keys(values).forEach((key: string) => {
                if (key !== 'configRef' && values[key]) {
                    if (typeof values[key] === 'object' && values[key] !== null) {
                        // Handle expression input type
                        const namespaces = values[key].namespaces;
                        const value = values[key].value;
                        const isExpression = values[key].isExpression;

                        if (value) {
                            if (isExpression) {
                                if (namespaces && namespaces.length > 0) {
                                    // Generate XML with namespaces
                                    const element = root.ele(key);
                                    namespaces.forEach((namespace: any) => {
                                        element.att(`xmlns:${namespace.prefix}`, namespace.uri);
                                    });
                                    element.txt(`{${value}}`);
                                } else {
                                    root.ele(key).txt(`{${value}}`);
                                }
                            } else {
                                root.ele(key).txt(value);
                            }
                        }
                    } else {
                        root.ele((key === 'connectionName') ? 'name' : key).txt(values[key]);
                    }
                }
            });
            const modifiedXml = template.end({ prettyPrint: true, headless: true });

            const visualizerState = await rpcClient.getVisualizerState();
            const projectUri = visualizerState.projectUri;
            const sep = visualizerState.pathSeparator;
            const localEntryPath = [projectUri, 'src', 'main', 'wso2mi', 'artifacts', 'local-entries'].join(sep);

            const connectionName = await rpcClient.getMiDiagramRpcClient().createConnection({
                connectionName: values['connectionName'],
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
                    <Field>
                        <Controller
                            name={element.name as string}
                            control={control}
                            rules={{ required: element.required === 'true' }}
                            defaultValue={element.defaultValue}
                            render={({ field }) => (
                                <TextField {...field}
                                    label={element.displayName}
                                    size={50}
                                    placeholder={element.helpTip}
                                    required={element.required === 'true'} />
                            )}
                        />
                    </Field>
                );
            case 'stringOrExpression':
                return (
                    <Field>
                        <Controller
                            name={element.name as string}
                            control={control}
                            rules={{ required: element.required === 'true' }}
                            defaultValue={{ "isExpression": false, "value": element.defaultValue, "namespaces": [] }}
                            render={({ field }) => (
                                <ExpressionField
                                    {...field} label={element.displayName}
                                    placeholder={element.helpTip}
                                    canChange={true}
                                    required={element.required === 'true'}
                                    openExpressionEditor={(value: ExpressionFieldValue, setValue: any) => handleOpenExprEditor(value, setValue, handleOnCancelExprEditorRef, sidePanelContext)}
                                />
                            )}
                        />
                    </Field>
                );
            case 'stringOrExpresion':
                return (
                    <Field>
                        <Controller
                            name={element.name as string}
                            control={control}
                            defaultValue={{ "isExpression": false, "value": element.defaultValue, "namespaces": [] }}
                            render={({ field }) => (
                                <ExpressionField
                                    {...field} label={element.displayName}
                                    placeholder={element.helpTip}
                                    canChange={true}
                                    required={element.required === 'true'}
                                    openExpressionEditor={(value: ExpressionFieldValue, setValue: any) => handleOpenExprEditor(value, setValue, handleOnCancelExprEditorRef, sidePanelContext)}
                                />
                            )}
                        />
                    </Field>
                );
            case 'booleanOrExpression':
                return (
                    <Field>
                        <Controller
                            name={element.name as string}
                            control={control}
                            defaultValue={element.defaultValue}
                            render={({ field }) => (
                                <AutoComplete
                                    label={element.displayName}
                                    name={element.name as string}
                                    items={["true", "false"]}
                                    onValueChange={(e: any) => {
                                        field.onChange(e);
                                    }}
                                    required={element.required === 'true'}
                                />
                            )}
                        />
                    </Field>
                );
            case 'comboOrExpression':
                return (
                    <Field>
                        <Controller
                            name={element.name as string}
                            control={control}
                            defaultValue={element.defaultValue}
                            render={({ field }) => (
                                <AutoComplete
                                    label={element.displayName}
                                    name={element.name as string}
                                    items={element.comboValues}
                                    value={field.value.value}
                                    onValueChange={(e: any) => {
                                        field.onChange(e);
                                    }}
                                    allowItemCreate={true}
                                    required={element.required === 'true'}
                                />
                            )}
                        />
                    </Field>
                );
            case 'textAreaOrExpression':
                return (
                    <Field>
                        <Controller
                            name={element.name as string}
                            control={control}
                            defaultValue={element.defaultValue}
                            render={({ field }) => (
                                <TextField {...field}
                                    label={element.displayName}
                                    size={50}
                                    placeholder={element.helpTip}
                                    value={field.value.value}
                                    required={element.required === 'true'} />
                            )}
                        />
                    </Field>
                );
            case 'integerOrExpression':
                return (
                    <Field>
                        <Controller
                            name={element.name as string}
                            control={control}
                            defaultValue={{ "isExpression": false, "value": element.defaultValue, "namespaces": [] }}
                            render={({ field }) => (
                                <ExpressionField
                                    {...field} label={element.displayName}
                                    placeholder={element.helpTip}
                                    canChange={true}
                                    required={element.required === 'true'}
                                    openExpressionEditor={(value: ExpressionFieldValue, setValue: any) => handleOpenExprEditor(value, setValue, handleOnCancelExprEditorRef, sidePanelContext)}
                                />
                            )}
                        />
                    </Field>
                );
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
                            onClick={handleSubmit(onAddConnection)}
                        >
                            Add
                        </Button>
                    </div>
                </>
            )}
        </>
    );
};

export default AddConnection;
