/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { useState } from 'react';
import { AutoComplete, Button, Icon, CheckBox, ComponentCard, FormCheckBox, FormGroup, RequiredFormInput, TextField, Typography } from '@wso2-enterprise/ui-toolkit';
import styled from '@emotion/styled';
import { Controller } from 'react-hook-form';
import { ExpressionField } from '@wso2-enterprise/mi-diagram/lib/components/Form/ExpressionField/ExpressionInput';
import { ExpressionFieldValue } from '@wso2-enterprise/mi-diagram/lib/components/Form/ExpressionField/ExpressionInput';
import { ExpressionEditor } from '@wso2-enterprise/mi-diagram/lib/components/sidePanel/expressionEditor/ExpressionEditor';
import { colors } from "@wso2-enterprise/ui-toolkit";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";

const Field = styled.div`
    margin-bottom: 12px;
`;

export interface FormGeneratorProps {
    formData: any;
    sequences?: string[];
    onEdit?: boolean;
    control: any;
    errors: any;
    setValue: any;
    watch: any;
    getValues: any;
    skipGeneralHeading?: boolean;
    ignoreFields?: string[];
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

interface ExpressionValueWithSetter {
    value: ExpressionFieldValue;
    setValue: (value: ExpressionFieldValue) => void;
};


export function FormGenerator(props: FormGeneratorProps) {
    const { formData, sequences, onEdit, control, errors, setValue, getValues, watch, skipGeneralHeading, ignoreFields } = props;
    const [currentExpressionValue, setCurrentExpressionValue] = useState<ExpressionValueWithSetter | null>(null);
    const [expressionEditorField, setExpressionEditorField] = useState<string | null>(null);
    const [autoGenerate, setAutoGenerate] = useState(!onEdit);
    const { rpcClient } = useVisualizerContext();

    function getNameForController(name: string | number) {
        return String(name).replace(/\./g, '__dot__');
    }

    const handleSequenceGeneration = (e: any) => {
        setAutoGenerate(e);
        if (e) {
            setValue("sequence", "");
            setValue("onError", "");
        }
    };

    const openFile = async () => {
        const request = {
            canSelectFiles: true,
            canSelectFolders: false,
            canSelectMany: false,
            defaultUri: "",
            title: "Select a file to be imported."
        }
        await rpcClient.getMiDiagramRpcClient().browseFile(request).then(response => {
            setValue("trustStoreCertificatePath", response.filePath, { shouldDirty: true });

        }).catch(e => { console.log(e); })
    }

    const ExpressionFieldComponent = ({ element, field }: { element: Element, field: any }) => {

        return expressionEditorField !== getNameForController(element.name) ? (
            <ExpressionField
                {...field}
                label={element.displayName}
                placeholder={element.helpTip}
                canChange={true}
                required={element.required === 'true'}
                errorMsg={errors[getNameForController(element.name)] && errors[getNameForController(element.name)].message.toString()}
                openExpressionEditor={(value: ExpressionFieldValue, setValue: any) => {
                    setCurrentExpressionValue({ value, setValue });
                    setExpressionEditorField(getNameForController(element.name));
                }}
            />
        ) : (
            <>
                <div style={{ display: "flex", alignItems: "center", gap: '10px' }}>
                    <label>{element.displayName}</label>
                    {element.required === "true" && <RequiredFormInput />}
                </div>
                <ExpressionEditor
                    value={currentExpressionValue.value || { isExpression: false, value: '', namespaces: [] }}
                    handleOnSave={(newValue) => {
                        if (currentExpressionValue) {
                            currentExpressionValue.setValue(newValue);
                        }
                        setExpressionEditorField(null);
                    }}
                    handleOnCancel={() => {
                        setExpressionEditorField(null);
                    }}
                />
            </>
        )
    }

    const sequenceFieldComponent = ({ element }: { element: Element }) => {
        return (
            <Controller
                name={getNameForController(element.name)}
                control={control}
                rules={
                    {
                        ...(element.required === 'true') && {
                            validate: (value) => {
                                if (!value || (typeof value === 'object' && !value.value)) {
                                    return "This field is required";
                                }
                                return true;
                            },
                        }
                    }
                }
                render={({ field }) => (
                    <Field>
                        <AutoComplete
                            name={getNameForController(element.name)}
                            label={element.displayName}
                            items={sequences}
                            value={field.value}
                            onValueChange={(e: any) => {
                                field.onChange(e);
                            }}
                            required={element.required === 'true'}
                            errorMsg={errors[getNameForController(element.name)] && errors[getNameForController(element.name)].message.toString()}
                            allowItemCreate={false}
                        />
                    </Field>
                )}
            />
        );
    }

    const renderFormElement = (element: Element, field: any) => {
        switch (element.inputType) {
            case 'string':
                if (element.name === 'connectionName') {
                    return null;
                }
                return (
                    <TextField {...field}
                        label={element.displayName}
                        size={50}
                        placeholder={element.helpTip}
                        required={element.required === 'true'}
                        errorMsg={errors[getNameForController(element.name)] && errors[getNameForController(element.name)].message.toString()}
                    />
                );
            case 'boolean':
                return (
                    <FormCheckBox
                        name={getNameForController(element.name)}
                        label={element.displayName}
                        control={control}
                    />
                );
            case 'checkbox':
                return (
                    <FormCheckBox
                        name={getNameForController(element.name)}
                        label={element.displayName}
                        control={control}
                    />
                );
            case 'combo':
                const comboitems = element.inputType === 'booleanOrExpression' ? ["true", "false"] : element.comboValues;
                return (
                    <AutoComplete
                        name={getNameForController(element.name)}
                        label={element.displayName}
                        errorMsg={errors[getNameForController(element.name)] && errors[getNameForController(element.name)].message.toString()}
                        items={comboitems}
                        value={field.value}
                        onValueChange={(e: any) => {
                            field.onChange(e);
                        }}
                        required={element.required === 'true'}
                        allowItemCreate={false}
                    />
                );
            case 'stringOrExpression':
            case 'stringOrExpresion':
            case 'textOrExpression':
            case 'textAreaOrExpression':
            case 'integerOrExpression':
                return ExpressionFieldComponent({ element, field });

            case 'booleanOrExpression':
            case 'comboOrExpression':
                const items = element.inputType === 'booleanOrExpression' ? ["true", "false"] : element.comboValues;
                const allowItemCreate = element.inputType === 'comboOrExpression';
                return (
                    <AutoComplete
                        name={getNameForController(element.name)}
                        label={element.displayName}
                        errorMsg={errors[getNameForController(element.name)] && errors[getNameForController(element.name)].message.toString()}
                        items={items}
                        value={field.value}
                        onValueChange={(e: any) => {
                            field.onChange(e);
                        }}
                        required={element.required === 'true'}
                        allowItemCreate={allowItemCreate}
                    />
                );
            case 'file':
                return (
                    <div>
                        <Typography>{element.displayName}</Typography>
                        <div style={{ display: "flex", flexDirection: "row", gap: "10px", alignItems: "center" }}>
                            <Button appearance="secondary" onClick={openFile}>
                                <Icon sx={{ marginTop: 2, marginRight: 5 }} name="ballerina" />
                                <div style={{ color: colors.editorForeground }}>Browse file</div>
                            </Button>
                            <Typography variant="body3">
                                {errors[getNameForController(element.name)] && errors[getNameForController(element.name)].message.toString() ? errors[getNameForController(element.name)].message.toString() : watch("trustStoreCertificatePath")}
                            </Typography>
                        </div>
                        
                    </div>
                );
            default:
                return null;
        }
    };

    const renderForm: any = (elements: any[]) => {
        return elements.map((element: { type: string; value: any; }) => {
            if (element.type === 'attribute') {
                if (element.value.hidden) {
                    setValue(getNameForController(element.value.name), element.value.defaultValue ?? "");
                    return;
                }

                if (ignoreFields?.includes(element.value.name)) {
                    return;
                }

                if (element.value.name === "sequence") {
                    return (
                        <>
                            {!onEdit && <CheckBox
                                label="Automatically generate sequences"
                                onChange={handleSequenceGeneration}
                                checked={autoGenerate}
                            />}
                            {!autoGenerate && sequenceFieldComponent({ element: element.value })}
                        </>);
                }

                if (element.value.name === "onError") {
                    return (
                        !autoGenerate && sequenceFieldComponent({ element: element.value })
                    );
                }
                
                if (element.value.enableCondition) {
                    return (
                        renderControllerIfConditionMet(element)
                    );
                }

                if (getValues(getNameForController(element.value.name)) === undefined && element.value.defaultValue) {
                    setValue(getNameForController(element.value.name), element.value.defaultValue)
                }

                return <Controller
                    name={getNameForController(element.value.name)}
                    control={control}
                    defaultValue={element.value.defaultValue ?? ""}
                    rules={
                        {
                            ...(element.value.required === 'true') && {
                                validate: (value) => {
                                    if (!value || (typeof value === 'object' && !value.value)) {
                                        return "This field is required";
                                    }
                                    return true;
                                },
                            }
                        }
                    }
                    render={({ field }) => (
                        <Field>
                            {renderFormElement(element.value, field)}
                        </Field>
                    )}
                />;
            } else if (element.type === 'attributeGroup') {
                return (
                    <>
                        {(element.value.groupName === "Generic" || (element.value.groupName === "General" && skipGeneralHeading)) ?
                            renderForm(element.value.elements) :
                            <>
                                <FormGroup
                                    key={element.value.groupName}
                                    title={`${element.value.groupName} Properties`}
                                    isCollapsed={(element.value.groupName === "Advanced" || !!element.value.isCollapsed) ?
                                        true : false
                                    }
                                >
                                    {renderForm(element.value.elements)}
                                </FormGroup>
                            </>
                        }
                    </>
                );
            }
            return null;
        });
    };

    const renderControllerIfConditionMet = (element: any) => {
        let watchStatements: boolean;

        if (Array.isArray(element.value.enableCondition)) {
            const firstElement = element.value.enableCondition[0];

            if (firstElement === "AND") {
                // Handle AND conditions
                watchStatements = true;
                const conditions = element.value.enableCondition.slice(1);
                const statements = conditions.forEach((condition: any) => {
                    const key = Object.keys(condition)[0];
                    const conditionKey = getNameForController(key);
                    const conditionValue = condition[key];
                    if (!(watch(conditionKey) === conditionValue && watchStatements)) {
                        watchStatements = false;
                    }
                });
            } else if (firstElement === "OR") {
                // Handle OR conditions
                watchStatements = false;
                const conditions = element.value.enableCondition.slice(1);
                const statements = conditions.forEach((condition: any) => {
                    const key = Object.keys(condition)[0];
                    const conditionKey = getNameForController(key);
                    const conditionValue = condition[key];
                    if (watch(conditionKey) === conditionValue || watchStatements) {
                        watchStatements = true;
                    }
                });
            } else if (firstElement === "NOT") {
                // Handle NOT conditions
                watchStatements = false;
                const condition = element.value.enableCondition.slice(1)[0];
                if (condition) {
                    const key = Object.keys(condition)[0];
                    const conditionKey = getNameForController(key);
                    const conditionValue = condition[key];
                    watchStatements = watch(conditionKey) !== conditionValue;
                }
            } else {
                // Handle Single condition
                const condition = element.value.enableCondition[0];
                if (condition) {
                    const key = Object.keys(condition)[0];
                    const conditionKey = getNameForController(key);
                    const conditionValue = condition[key];
                    watchStatements = watch(conditionKey) === conditionValue;
                }
            }
        }

        if (watchStatements) {
            if (getValues(getNameForController(element.value.name)) === undefined && element.value.defaultValue) {
                setValue(getNameForController(element.value.name), element.value.defaultValue)
            }

            return (
                <Controller
                    name={getNameForController(element.value.name)}
                    control={control}
                    defaultValue={element.value.defaultValue ?? ""}
                    rules={
                        {
                            ...(element.value.required === 'true') && {
                                validate: (value) => {
                                    if (!value || (typeof value === 'object' && !value.value)) {
                                        return "This field is required";
                                    }
                                    return true;
                                },
                            }
                        }
                    }
                    render={({ field }) => (
                        <Field>
                            {renderFormElement(element.value, field)}
                        </Field>
                    )}
                />
            );
        } else {
            if (getValues(getNameForController(element.value.name))) {
                setValue(getNameForController(element.value.name), "")
            }
        }

        return null; // Return null if conditions are not met
    }

    return (
        formData && formData.elements && formData.elements.length > 0 && (
            renderForm(formData.elements)
        )
    );
};

export default FormGenerator;
