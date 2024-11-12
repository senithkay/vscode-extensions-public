/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { useEffect, useRef, useState } from 'react';
import { AutoComplete, CheckBox, ComponentCard, FormCheckBox, FormGroup, RequiredFormInput, TextField, Typography } from '@wso2-enterprise/ui-toolkit';
import styled from '@emotion/styled';
import { Controller } from 'react-hook-form';
import React from 'react';
import { ExpressionFieldValue, ExpressionField, ParamManager, ParamValue, ParamField, Keylookup } from '.';
import ExpressionEditor from '../sidePanel/expressionEditor/ExpressionEditor';
import { sidepanelAddPage, sidepanelGoBack } from '../sidePanel';
import SidePanelContext from '../sidePanel/SidePanelContexProvider';
import { openPopup } from '../sidePanel/Pages/mediators/common';
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';

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
    reset: any;
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
    keyType?: string;
}

interface ExpressionValueWithSetter {
    value: ExpressionFieldValue;
    setValue: (value: ExpressionFieldValue) => void;
};


export function FormGenerator(props: FormGeneratorProps) {
    const { rpcClient } = useVisualizerContext();
    const sidePanelContext = React.useContext(SidePanelContext);
    const { formData, sequences, onEdit, control, errors, setValue, reset, getValues, watch, skipGeneralHeading, ignoreFields } = props;
    const [currentExpressionValue, setCurrentExpressionValue] = useState<ExpressionValueWithSetter | null>(null);
    const [expressionEditorField, setExpressionEditorField] = useState<string | null>(null);
    const [autoGenerate, setAutoGenerate] = useState(!onEdit);
    const [isLoading, setIsLoading] = React.useState(true);
    const handleOnCancelExprEditorRef = useRef(() => { });

    useEffect(() => {
        const defaultValues = getDefaultValues(formData.elements);
        reset(defaultValues);
        setIsLoading(false);
    }, [props.formData]);

    useEffect(() => {
        handleOnCancelExprEditorRef.current = () => {
            sidepanelGoBack(sidePanelContext);
        };
    }, [sidePanelContext.pageStack]);

    function getDefaultValues(elements: any[]) {
        const values: any = {};
        for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            const key = getNameForController(element.value.name);
            if (element.type === 'table') {
                values[key] = getParamManagerConfig(element.value.elements, element.value.tableKey, element.value.tableValue);
            } else if (element.type === 'attributeGroup') {
                Object.assign(values, getDefaultValues(element.value.elements));
            } else {
                values[key] = element.value.currentValue ?? element.value.defaultValue ?? "";
            }
        }
        return values;
    }

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
        const name = getNameForController(element.name);
        const isRequired = element.required === 'true';
        const errorMsg = errors[name] && errors[name].message.toString();
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
                        required={isRequired}
                        errorMsg={errorMsg}
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
                        errorMsg={errorMsg}
                        items={comboitems}
                        value={field.value}
                        onValueChange={(e: any) => {
                            field.onChange(e);
                        }}
                        required={isRequired}
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
                        errorMsg={errorMsg}
                        items={items}
                        value={field.value}
                        onValueChange={(e: any) => {
                            field.onChange(e);
                        }}
                        required={isRequired}
                        allowItemCreate={allowItemCreate}
                    />
                );
            case 'key':
            case 'comboOrKey': {
                return (<Keylookup
                    value={field.value}
                    filterType={element.keyType as any}
                    label={element.displayName}
                    allowItemCreate={element.inputType === 'comboOrKey'}
                    onValueChange={field.onChange}
                    required={isRequired}
                    errorMsg={errorMsg}
                    additionalItems={element.comboValues}
                    onCreateButtonClick={(element.inputType === 'comboOrKey' && !Array.isArray(element.keyType)) ? (fetchItems: any, handleValueChange: any) => {
                        openPopup(rpcClient, element.keyType, fetchItems, handleValueChange);
                    } : undefined}
                />)
            }
            case 'ParamManager': {
                return (
                    <ParamManager
                        paramConfigs={field.value}
                        readonly={false}
                        onChange={(values) => {
                            values.paramValues = values.paramValues.map((param: any) => {
                                const property: ParamValue[] = param.paramValues;
                                param.key = property[0].value;
                                param.value = (property[1].value as ExpressionFieldValue).value;
                                param.icon = 'query';
                                return param;
                            });
                            field.onChange(values);
                        }}
                    />);
            }
            default:
                return null;
        }
    };

    const getParamManagerConfig = (elements: any[], tableKey: string, tableValue: string) => {
        let paramValues: any = [];
        let paramFields: any = [];

        const tableKeys: string[] = [];
        elements.forEach((attribute: any) => {
            const { name, displayName, enableCondition, inputType, required, comboValues, helpTip } = attribute.value;
            let defaultValue: any = [];

            tableKeys.push(name);
            const isRequired = required == true || required == 'true';

            let type;
            if (attribute.type === 'table') {
                type = 'ParamManager';
            } else if (inputType === 'string' || inputType === 'registry') {
                type = 'TextField';
            } else if (inputType === 'stringOrExpression' || inputType === 'expression') {
                type = 'ExprField';
                let isExpression = inputType === 'expression';
                defaultValue = { isExpression: isExpression, value: defaultValue };
            } else if (inputType === 'connection' || inputType === 'comboOrExpression' || inputType === 'combo') {
                type = 'Dropdown';
            } else if (inputType === 'checkbox') {
                type = "Checkbox";
                if (!defaultValue) {
                    defaultValue = false;
                }
            } else if (inputType == "key" || inputType == "keyOrExpression") {
                type = "KeyLookup";
            }

            const paramField: ParamField =
            {
                type: type as any,
                label: displayName,
                defaultValue: defaultValue,
                ...(helpTip && { placeholder: helpTip }),
                isRequired: isRequired,
                ...(type === 'ExprField') && { canChange: inputType === 'stringOrExpression' },
                ...(type === 'Dropdown') && { values: comboValues.map((value: string) => `${value}`), },
                ...(type === 'KeyLookup') && { filterType: attribute.value.keyType },
                ...(enableCondition) && { enableCondition: generateParammanagerCondition(enableCondition, tableKeys) },
            };

            if (type === 'ExprField') {
                paramField.openExpressionEditor = (value: ExpressionFieldValue, setValue: any) => handleOpenExprEditor(value, setValue, handleOnCancelExprEditorRef);

            } else if (type === 'ParamManager') {
                const { paramValues: paramValues2, paramFields: paramFields2 } = getParamManagerConfig(attribute.value.elements, tableKey, tableValue);
                paramField.paramManager = {
                    paramConfigs: {
                        paramValues: paramValues2,
                        paramFields: [paramFields2
                        ]
                    },
                    openInDrawer: true,
                    addParamText: `New ${displayName}`
                };
            }
            paramFields.push(paramField);
        })

        return { paramValues, paramFields };

        function generateParammanagerCondition(enableCondition: any[], keys: string[]) {
            enableCondition.forEach((conditionElement: any) => {
                if (Array.isArray(conditionElement)) {
                    return generateParammanagerCondition(conditionElement, keys);
                }
                if (typeof conditionElement !== 'object') {
                    return;
                }
                const condition = Object.keys(conditionElement)[0];
                const conditionKey = keys.indexOf(condition);
                const value = conditionElement[condition];
                delete conditionElement[condition];
                conditionElement[conditionKey] = value;
            });

            return enableCondition;
        }

        function handleOpenExprEditor(value: ExpressionFieldValue, setValue: any, handleOnCancelExprEditorRef: any) {
            const content = <ExpressionEditor
                value={value}
                handleOnSave={(value) => {
                    setValue(value);
                    handleOnCancelExprEditorRef.current();
                }}
                handleOnCancel={() => {
                    handleOnCancelExprEditorRef.current();
                }}
            />;
            sidepanelAddPage(sidePanelContext, content, "Expression Editor");
        }
    }

    const renderForm: any = (elements: any[]) => {
        return elements.map((element: { type: string; value: any; }) => {
            const name = getNameForController(element.value.name);

            if (element.type === 'attributeGroup') {
                return (
                    <>
                        {(element.value.groupName === "Generic" || (element.value.groupName === "General" && skipGeneralHeading)) ?
                            renderForm(element.value.elements) :
                            <Field>
                                <FormGroup
                                    key={element.value.groupName}
                                    title={element.value.groupName}
                                    isCollapsed={(element.value.groupName === "Advanced" || !!element.value.isCollapsed) ?
                                        true : false
                                    }
                                >
                                    {renderForm(element.value.elements)}
                                </FormGroup>
                            </Field>
                        }
                    </>
                );
            } else {
                if (element.value.hidden) {
                    setValue(name, element.value.defaultValue ?? "");
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

                if (getValues(name) === undefined && element.value.defaultValue) {
                    setValue(name, element.value.defaultValue)
                }

                return (
                    renderControllerIfConditionMet(element)
                );
            }
            return null;
        });
    };

    const renderControllerIfConditionMet = (element: any) => {
        const name = getNameForController(element.value.name);
        let shouldRender: boolean = true;

        if (Array.isArray(element.value.enableCondition)) {
            shouldRender = getConditions(element.value.enableCondition);
        }

        if (element.type === 'table') {
            element.value.inputType = 'ParamManager';
        }

        if (shouldRender) {
            if (getValues(name) === undefined && element.value.defaultValue) {
                setValue(name, element.value.defaultValue)
            }

            return (
                <Controller
                    name={name}
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
            if (getValues(name)) {
                setValue(name, "")
            }
        }

        return null; // Return null if conditions are not met

        function getConditions(conditions: any): boolean {
            const evaluateCondition = (condition: any) => {
                const key = Object.keys(condition)[0];
                return watch(getNameForController(key)) === condition[key];
            };

            if (Array.isArray(conditions)) {
                const firstElement = conditions[0];
                const restConditions = conditions.slice(1);

                if (firstElement === "AND") {
                    return restConditions.every(condition => Array.isArray(condition) ? getConditions(condition) : evaluateCondition(condition));
                } else if (firstElement === "OR") {
                    return restConditions.some(condition => Array.isArray(condition) ? getConditions(condition) : evaluateCondition(condition));
                } else if (firstElement === "NOT") {
                    const condition = conditions[1];
                    return Array.isArray(condition) ? !getConditions(condition) : !evaluateCondition(condition);
                } else {
                    return evaluateCondition(conditions[0]);
                }
            }
            return false; // Default case if conditions are not met
        }
    }

    return (
        formData && formData.elements && formData.elements.length > 0 && !isLoading && (
            renderForm(formData.elements)
        )
    );
};

export default FormGenerator;
