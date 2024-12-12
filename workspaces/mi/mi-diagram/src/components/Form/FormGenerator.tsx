/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { useEffect, useRef, useState } from 'react';
import { AutoComplete, CheckBox, Codicon, ComponentCard, FormCheckBox, FormGroup, Icon, LinkButton, RequiredFormInput, TextArea, TextField, Tooltip, Typography } from '@wso2-enterprise/ui-toolkit';
import styled from '@emotion/styled';
import { Controller } from 'react-hook-form';
import React from 'react';
import { ExpressionFieldValue, ExpressionField, ParamManager, ParamField, Keylookup, FormKeylookup, FormExpressionField } from '.';
import ExpressionEditor from '../sidePanel/expressionEditor/ExpressionEditor';
import { handleOpenExprEditor, sidepanelAddPage, sidepanelGoBack } from '../sidePanel';
import SidePanelContext from '../sidePanel/SidePanelContexProvider';
import { getParamManagerFromValues, getParamManagerOnChange, openPopup } from './common';
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';
import { CodeTextArea } from './CodeTextArea';
import { Range } from "@wso2-enterprise/mi-syntax-tree/lib/src";

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
    autoGenerateSequences?: boolean;
    range?: Range;
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
    configurableType?: string;
    addParamText?: string;
}

interface ExpressionValueWithSetter {
    value: ExpressionFieldValue;
    setValue: (value: ExpressionFieldValue) => void;
};


export function FormGenerator(props: FormGeneratorProps) {
    const { rpcClient } = useVisualizerContext();
    const sidePanelContext = React.useContext(SidePanelContext);
    const {
        formData,
        onEdit,
        control,
        errors,
        setValue,
        reset,
        getValues,
        watch,
        skipGeneralHeading,
        ignoreFields,
        connections,
        addNewConnection,
        autoGenerateSequences,
        range
    } = props;
    const [currentExpressionValue, setCurrentExpressionValue] = useState<ExpressionValueWithSetter | null>(null);
    const [expressionEditorField, setExpressionEditorField] = useState<string | null>(null);
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
        } else if (['stringOrExpression', 'expression', 'keyOrExpression', 'resourceOrExpression'].includes(inputType) &&
            (!currentValue || typeof currentValue !== 'object' || !('isExpression' in currentValue))) {
            return { isExpression: inputType === "expression", value: currentValue ?? "" };
        } else if (inputType === 'checkbox') {
            return currentValue ?? false;
        } else {
            return currentValue ?? "";
        }
    }

    function getNameForController(name: string | number) {
        if (name === 'configRef') {
            return 'configKey';
        }
        return String(name).replace(/\./g, '__dot__');
    }

    const ExpressionFieldComponent = ({ element, canChange, field, helpTipElement, placeholder, isRequired }: { element: Element, canChange: boolean, field: any, helpTipElement: React.JSX.Element, placeholder: string, isRequired: boolean }) => {
        const name = getNameForController(element.name);

        return expressionEditorField !== name ? (
            <ExpressionField
                {...field}
                label={element.displayName}
                labelAdornment={helpTipElement}
                placeholder={placeholder}
                canChange={canChange}
                required={isRequired}
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
                addParamText={element.addParamText}
                onChange={(values) => {
                    values.paramValues = getParamManagerOnChange(element, values);
                    field.onChange(values);
                }} />
        </ComponentCard>;
    }

    const FormExpressionFieldComponent = (element: Element, field: any) => {
        return (
            <FormExpressionField
                {...field}
                label={element.displayName}
                required={element.required === 'true'}
                placeholder={element.placeholder}
                nodeRange={range}
            />
        );
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

        let keyType = element.keyType;
        if (keyType?.conditionField) {
            const conditionFieldValue = watch(getNameForController(keyType.conditionField));
            const conditionalKeyType = keyType.values.find((value: any) => value[conditionFieldValue]);
            keyType = conditionalKeyType?.[conditionFieldValue];
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
            case 'textArea':
                return (
                    <TextArea {...field}
                        label={element.displayName}
                        labelAdornment={helpTipElement}
                        rows={5}
                        placeholder={placeholder}
                        required={isRequired}
                        errorMsg={errorMsg}
                    />
                );
            case 'boolean':
            case 'checkbox':
                return (
                    <CheckBox
                        {...field}
                        label={element.displayName}
                        labelAdornment={helpTipElement}
                        checked={field.value}
                    />
                );
            case 'stringOrExpression':
            case 'stringOrExpresion':
            case 'textOrExpression':
            case 'textAreaOrExpression':
            case 'integerOrExpression':
            case 'expression':
                return ExpressionFieldComponent({ element, canChange: element.inputType !== 'expression', field, helpTipElement, placeholder, isRequired });

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
            case 'comboOrKey':
            case 'registry':
            case 'resource': 
            case 'resourceOrExpression': {
                let onCreateButtonClick;
                if (!Array.isArray(keyType)) {
                    onCreateButtonClick = (fetchItems: any, handleValueChange: any) => {
                        const resolvedView = element.inputType === 'registry' || element.inputType === 'resource' || element.inputType === 'resourceOrExpression' ? "addResource" : element.keyType;
                        openPopup(rpcClient, resolvedView, fetchItems, handleValueChange, undefined, { type: keyType });
                    }
                }

                return (<Keylookup
                    value={field.value}
                    filterType={(keyType as any) ?? "resource"}
                    label={element.displayName}
                    labelAdornment={helpTipElement}
                    allowItemCreate={element.canAddNew === true || (element.canAddNew as any) === 'true'}
                    onValueChange={field.onChange}
                    required={isRequired}
                    errorMsg={errorMsg}
                    additionalItems={element.comboValues}
                    {...element.inputType.endsWith('OrExpression') && { canChangeEx: true }}
                    {...element.inputType.endsWith('OrExpression') && { exprToggleEnabled: true }}
                    openExpressionEditor={(value: ExpressionFieldValue, setValue: any) => handleOpenExprEditor(value, setValue, handleOnCancelExprEditorRef, sidePanelContext)}
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
                    await rpcClient.getMiVisualizerRpcClient().addConfigurable({
                        projectUri: '',
                        configurableName: field.value.value,
                        configurableType: element.configurableType
                    });
                    handleValueChange(field.value.value);
                }
                return (
                    <div>
                        <Keylookup 
                            name={getNameForController(element.name)}
                            label={element.displayName}
                            errorMsg={errors[getNameForController(element.name)] && errors[getNameForController(element.name)].message.toString()}
                            filter={(configurableType) => configurableType === element.configurableType}
                            filterType='configurable'
                            value={field.value.value ? field.value.value : ""}
                            onValueChange={(e: any) => {
                                field.onChange({ isConfigurable: true, value: e });
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
            const { name, displayName, enableCondition, inputType, required, comboValues, helpTip, placeholder } = attribute.value;
            let defaultValue: any = attribute.value.defaultValue;

            tableKeys.push(name);
            const isRequired = required == true || required == 'true';

            const helpTipElement = helpTip ? (
                <Tooltip
                    content={helpTip}
                    position='right'
                >
                    <Icon name="question" isCodicon iconSx={{ fontSize: '18px' }} sx={{ marginLeft: '5px', cursor: 'help' }} />
                </Tooltip>
            ) : null;

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
                labelAdornment: helpTipElement,
                placeholder: placeholder,
                defaultValue: defaultValue,
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
            const name = getNameForController(element.value.groupName ?? element.value.name);
            if (element?.value?.enableCondition !== undefined) {
                const shouldRender = getConditions(element.value.enableCondition);
                if (!shouldRender) {
                    if (getValues(name) !== undefined) {
                        setValue(name, undefined)
                    }
                    return;
                }
            }

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
                if (element.value.hidden) {
                    return;
                }

                if (ignoreFields?.includes(element.value.name)) {
                    return;
                }

                return (
                    renderController(element)
                );
            }
        });
    };

    const renderController = (element: any) => {
        const name = getNameForController(element.value.name);
        const isRequired = typeof element.value.required === 'boolean' ? element.value.required : element.value.required === 'true';
        const defaultValue = getDefaultValue(element);

        if (getValues(name) === undefined) {
            setValue(name, defaultValue);
        }

        if (element.type === 'table') {
            element.value.inputType = 'ParamManager';
        }

        return (
            <Controller
                name={name}
                control={control}
                defaultValue={defaultValue}
                rules={
                    {
                        ...(isRequired) && {
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
    }

    function getConditions(conditions: any): boolean {
        const evaluateCondition = (condition: any) => {
            const [conditionKey] = Object.keys(condition);
            const expectedValue = condition[conditionKey];
            const currentVal = watch(getNameForController(conditionKey));

            if (conditionKey.includes('.')) {
                const [key, subKey] = conditionKey.split('.');
                const parentValue = watch(getNameForController(key));
                return parentValue?.[subKey] === expectedValue;
            }
            return currentVal === condition[conditionKey] || (typeof condition[conditionKey] === 'string' && String(currentVal) === condition[conditionKey]);
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
        return conditions; // Default case if conditions are not met
    }

    return (
        formData && formData.elements && formData.elements.length > 0 && !isLoading && (
            <>
                {formData.help && (
                    <div style={{
                        padding: "10px",
                        marginBottom: "20px",
                        borderBottom: "1px solid var(--vscode-editorWidget-border)",
                        display: "flex",
                        flexDirection: 'row'
                    }}>
                        {typeof formData.help === 'string' && formData.help.includes('<')
                            ? <div dangerouslySetInnerHTML={{ __html: formData.help }} />
                            : <Typography variant="body3">{formData.help}</Typography>
                        }
                        {formData.doc && <a href={formData.doc}><Icon name="question" isCodicon iconSx={{ fontSize: '18px' }} sx={{ marginLeft: '5px', cursor: 'help' }} /></a>}
                    </div>
                )}
                {renderForm(formData.elements)}
            </>
        )
    );
};

export default FormGenerator;
