/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { useEffect, useRef, useState } from 'react';
import { AutoComplete, CheckBox, Codicon, ComponentCard, FormCheckBox, FormGroup, Icon, LinkButton, RequiredFormInput, TextField, Tooltip, Typography, RadioButtonGroup } from '@wso2-enterprise/ui-toolkit';
import styled from '@emotion/styled';
import { Controller } from 'react-hook-form';
import React from 'react';
import { ExpressionFieldValue, ExpressionField, ParamManager, ParamField, Keylookup, FormKeylookup } from '.';
import ExpressionEditor from '../sidePanel/expressionEditor/ExpressionEditor';
import { handleOpenExprEditor, sidepanelAddPage, sidepanelGoBack } from '../sidePanel';
import SidePanelContext from '../sidePanel/SidePanelContexProvider';
import { getParamManagerFromValues, getParamManagerOnChange, openPopup } from './common';
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';
import { CodeTextArea } from './CodeTextArea';
import { removeConfigurableFormat, isCertificateFileName, isConfigurable } from './utils';

const Field = styled.div`
    margin-bottom: 12px;
`;

const cardStyle = {
    display: "block",
    margin: "15px 0",
    padding: "0 15px 15px 15px",
    width: "auto",
    cursor: "auto"
};

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
    connections?: string[];
    addNewConnection?: any;
}

interface Element {
    inputType: any;
    name: string | number;
    displayName: any;
    description?: string;
    required: string;
    helpTip: any;
    placeholder: any;
    comboValues?: any[];
    defaultValue?: any;
    currentValue?: any;
    allowedConnectionTypes?: string[];
    keyType?: any;
    canAddNew?: boolean;
    elements?: any[];
    tableKey?: string;
    tableValue?: string;
}

interface ExpressionValueWithSetter {
    value: ExpressionFieldValue;
    setValue: (value: ExpressionFieldValue) => void;
};


export function FormGenerator(props: FormGeneratorProps) {
    const { rpcClient } = useVisualizerContext();
    const sidePanelContext = React.useContext(SidePanelContext);
    const { formData, sequences, onEdit, control, errors, setValue, reset, getValues, watch, skipGeneralHeading, ignoreFields, connections, addNewConnection } = props;
    const [currentExpressionValue, setCurrentExpressionValue] = useState<ExpressionValueWithSetter | null>(null);
    const [expressionEditorField, setExpressionEditorField] = useState<string | null>(null);
    const [autoGenerate, setAutoGenerate] = useState(!onEdit);
    const [isLoading, setIsLoading] = React.useState(true);
    const handleOnCancelExprEditorRef = useRef(() => { });

    useEffect(() => {
        setIsLoading(true);
        handleOnCancelExprEditorRef.current = () => {
            sidepanelGoBack(sidePanelContext);
        };

        if (formData.elements) {
            const defaultValues = getDefaultValues(formData.elements);
            reset(defaultValues);
        }
        setIsLoading(false);
    }, [sidePanelContext.pageStack, formData]);

    function getDefaultValues(elements: any[]) {
        const defaultValues: Record<string, any> = {};
        elements.forEach((element: any) => {
            const name = getNameForController(element.value.name);
            if (element.type === 'attributeGroup') {
                Object.assign(defaultValues, getDefaultValues(element.value.elements));
            } else {
                defaultValues[name] = getDefaultValue(element);
            }
        });
        return defaultValues;
    }

    function getDefaultValue(element: any) {
        const type = element.type;
        const value = element.value;
        const inputType = value.inputType;
        const currentValue = value.currentValue ?? value.defaultValue;

        if (type === 'table') {
            return getParamManagerConfig(value.elements, value.tableKey, value.tableValue, currentValue);
        } else if (['stringOrExpression', 'expression', 'keyOrExpression'].includes(inputType) &&
            (!currentValue || typeof currentValue !== 'object' || !('isExpression' in currentValue))) {
            return { isExpression: inputType === "expression", value: currentValue ?? "" };
        } else {
            return currentValue ?? "";
        }
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

    const ExpressionFieldComponent = ({ element, canChange, field, helpTipElement, placeholder }: { element: Element, canChange: boolean, field: any, helpTipElement: React.JSX.Element, placeholder: string }) => {
        const name = getNameForController(element.name);

        return expressionEditorField !== name ? (
            <ExpressionField
                {...field}
                label={element.displayName}
                labelAdornment={helpTipElement}
                placeholder={placeholder}
                canChange={canChange}
                required={element.required || element.required === 'true'}
                isTextArea={element.inputType === 'textAreaOrExpression'}
                errorMsg={errors[name] && errors[name].message.toString()}
                openExpressionEditor={(value: ExpressionFieldValue, setValue: any) => {
                    setCurrentExpressionValue({ value, setValue });
                    setExpressionEditorField(name);
                }}
            />
        ) : (
            <>
                <div style={{ display: "flex", alignItems: "center", gap: '10px' }}>
                    <label>{element.displayName}</label>
                    {element.required === "true" && <RequiredFormInput />}
                    <div style={{ paddingTop: '5px' }}>
                        {helpTipElement}
                    </div>
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

    function ParamManagerComponent(element: Element, isRequired: boolean, helpTipElement: React.JSX.Element, field: any) {
        return <ComponentCard sx={cardStyle} disbaleHoverEffect>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="h3">{element.displayName}</Typography>
                {isRequired && (<RequiredFormInput />)}
                <div style={{ paddingTop: '5px' }}>
                    {helpTipElement}
                </div>
            </div>
            <Typography variant="body3">{element.description}</Typography>

            <ParamManager
                paramConfigs={field.value}
                readonly={false}
                onChange={(values) => {
                    values.paramValues = getParamManagerOnChange(element, values);
                    field.onChange(values);
                }} />
        </ComponentCard>;
    }

    const renderFormElement = (element: Element, field: any) => {
        const name = getNameForController(element.name);
        const isRequired = typeof element.required === 'boolean' ? element.required : element.required === 'true';
        const errorMsg = errors[name] && errors[name].message.toString();
        const helpTip = element.helpTip;

        const helpTipElement = helpTip ? (
            <Tooltip
                content={helpTip}
                position='right'
            >
                <Icon name="question" isCodicon iconSx={{ fontSize: '18px' }} sx={{ marginLeft: '5px', cursor: 'help' }} />
            </Tooltip>
        ) : null;

        let placeholder = element.placeholder;
        if (placeholder?.conditionField) {
            const conditionFieldValue = watch(getNameForController(placeholder.conditionField));
            const conditionalPlaceholder = placeholder.values.find((value: any) => value[conditionFieldValue]);
            placeholder = conditionalPlaceholder?.[conditionFieldValue];
        }

        switch (element.inputType) {
            case 'string':
                if (element.name === 'connectionName') {
                    return null;
                }
                return (
                    <TextField {...field}
                        label={element.displayName}
                        labelAdornment={helpTipElement}
                        size={50}
                        placeholder={placeholder}
                        required={isRequired}
                        errorMsg={errorMsg}
                    />
                );
            case 'boolean':
                return (
                    <FormCheckBox
                        name={name}
                        label={element.displayName}
                        control={control}
                    />
                );
            case 'checkbox':
                return (
                    <FormCheckBox
                        name={name}
                        label={element.displayName}
                        control={control}
                    />
                );
            case 'stringOrExpression':
            case 'stringOrExpresion':
            case 'textOrExpression':
            case 'textAreaOrExpression':
            case 'integerOrExpression':
            case 'expression':
                return ExpressionFieldComponent({ element, canChange: element.inputType !== 'expression', field, helpTipElement, placeholder });

            case 'booleanOrExpression':
            case 'comboOrExpression':
            case 'combo':
                const items = element.inputType === 'booleanOrExpression' ? ["true", "false"] : element.comboValues;
                const allowItemCreate = element.inputType === 'comboOrExpression';
                return (
                    <AutoComplete
                        name={name}
                        label={element.displayName}
                        labelAdornment={helpTipElement}
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
            case 'keyOrExpression':
                return (
                    <FormKeylookup
                        control={control}
                        name={name}
                        label={element.displayName}
                        filterType={element.keyType}
                        allowItemCreate={element.canAddNew}
                        required={true}
                        errorMsg={errorMsg}
                        {...element.inputType === 'keyOrExpression' && { canChangeEx: true }}
                        {...element.inputType === 'keyOrExpression' && { exprToggleEnabled: true }}
                        openExpressionEditor={(value: ExpressionFieldValue, setValue: any) => handleOpenExprEditor(value, setValue, handleOnCancelExprEditorRef, sidePanelContext)}
                        onCreateButtonClick={element.canAddNew ? (fetchItems: any, handleValueChange: any) => {
                            openPopup(rpcClient, element.keyType, fetchItems, handleValueChange);
                        } : undefined}
                    />
                );
            case 'comboOrKey':
            case 'registry':
            case 'resource': {
                let onCreateButtonClick;
                if (!Array.isArray(element.keyType)) {
                    onCreateButtonClick = (fetchItems: any, handleValueChange: any) => {
                        openPopup(rpcClient, element.inputType === 'comboOrKey' ? element.keyType : "addResource", fetchItems, handleValueChange, undefined, { type: element.keyType });
                    }
                }

                return (<Keylookup
                    value={field.value}
                    filterType={(element.keyType as any) ?? "resource"}
                    label={element.displayName}
                    labelAdornment={helpTipElement}
                    allowItemCreate={true}
                    onValueChange={field.onChange}
                    required={isRequired}
                    errorMsg={errorMsg}
                    additionalItems={element.comboValues}
                    onCreateButtonClick={onCreateButtonClick}
                />)
            }
            case 'ParamManager': {
                return (
                    ParamManagerComponent(element, isRequired, helpTipElement, field)
                );
            }
            case 'codeTextArea':
                return (<CodeTextArea
                    {...field}
                    label={element.displayName}
                    placeholder={placeholder}
                    required={isRequired}
                    resize="vertical"
                    growRange={{ start: 5, offset: 10 }}
                    errorMsg={errorMsg}
                />);
            case 'configurable': {
                const onCreateButtonClick = async (fetchItems: any, handleValueChange: any) => {
                    await rpcClient.getMiVisualizerRpcClient().handleCertificateConfigurable({
                        projectUri: '',
                        configurableName: field.value.value
                    });
                    handleValueChange(field.value.value);
                }
                return (
                    <div>
                        <Keylookup 
                            name={getNameForController(element.name)}
                            label={element.displayName}
                            errorMsg={errors[getNameForController(element.name)] && errors[getNameForController(element.name)].message.toString()}
                            filter={(configurableType) => configurableType === "cert"}
                            filterType='configurable'
                            value={field.value.value && !isCertificateFileName(field.value.value) ? field.value.value : ""}
                            onValueChange={(e: any) => {
                                field.onChange({ isCertificate: true, value: e, type: field.value.type });
                            }}
                            required={false}
                            allowItemCreate={true}
                            onCreateButtonClick={onCreateButtonClick}
                        />
                    </div>
                );
            }
            case 'connection':
                return (
                    <>
                        <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", width: '100%', gap: '10px' }}>
                            <div style={{ display: "flex", alignItems: "center", gap: '10px' }}>
                                <label>{element.displayName}</label>
                                {element.required === 'true' && <RequiredFormInput />}
                            </div>
                            <LinkButton onClick={() => addNewConnection()}>
                                <Codicon name="plus" />Add new connection
                            </LinkButton>
                        </div>
                        <AutoComplete
                            name="configKey"
                            errorMsg={errors[getNameForController("configKey")] && errors[getNameForController("configKey")].message.toString()}
                            items={connections}
                            value={field.value}
                            onValueChange={(e: any) => {
                                field.onChange(e);
                            }}
                            required={element.required === 'true'}
                            allowItemCreate={false}
                        />
                    </>);
            default:
                return null;
        }
    };

    const getParamManagerConfig = (elements: any[], tableKey: string, tableValue: string, values?: any[]) => {
        let paramFields: any = [];

        const tableKeys: string[] = [];
        elements.forEach((attribute: any) => {
            const { name, displayName, enableCondition, inputType, required, comboValues, helpTip } = attribute.value;
            let defaultValue: any = attribute.value.defaultValue;

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
                ...(type === 'Dropdown') && { values: comboValues },
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
                        paramFields: paramFields2
                    },
                    openInDrawer: true,
                    addParamText: `New ${displayName}`
                };
            }
            paramFields.push(paramField);
        })

        let keyIndex = tableKeys.indexOf(tableKey) ?? 0;
        let valueIndex = tableKeys.indexOf(tableValue) ?? 1;
        const paramValues = values ? getParamManagerFromValues(values, keyIndex, valueIndex) : [];
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
                                    sx={{ paddingBottom: '0px', gap: '0px' }}
                                >
                                    {renderForm(element.value.elements)}
                                </FormGroup>
                            </Field>
                        }
                    </>
                );
            } else {
                const name = getNameForController(element.value.name);
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

                return (
                    renderControllerIfConditionMet(element)
                );
            }
        });
    };

    const renderControllerIfConditionMet = (element: any) => {
        const name = element.value.name === 'configRef' ? 'configKey' : getNameForController(element.value.name);
        let shouldRender: boolean = true;

        if (Array.isArray(element.value.enableCondition)) {
            shouldRender = getConditions(element.value.enableCondition);
        }

        if (element.type === 'table') {
            element.value.inputType = 'ParamManager';
        }

        if (shouldRender) {

            return (
                <Controller
                    name={name}
                    control={control}
                    defaultValue={getDefaultValue(element)}
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
                setValue(name, undefined)
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
            <>
                {formData.help && (
                    <div style={{ padding: "10px", marginBottom: "20px", borderBottom: "1px solid var(--vscode-editorWidget-border)" }}>
                        {typeof formData.help === 'string' && formData.help.includes('<')
                            ? <div dangerouslySetInnerHTML={{ __html: formData.help }} />
                            : <Typography variant="body3">{formData.help}</Typography>
                        }
                    </div>
                )}
                {renderForm(formData.elements)}
            </>
        )
    );
};

export default FormGenerator;
