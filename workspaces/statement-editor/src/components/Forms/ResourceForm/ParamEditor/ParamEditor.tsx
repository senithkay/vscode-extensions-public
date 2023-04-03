/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */
// tslint:disable: jsx-no-multiline-js

import React, { useContext, useEffect, useState } from 'react';

import { LiteExpressionEditor, LiteTextField, TypeBrowser } from '@wso2-enterprise/ballerina-expression-editor';
import {
    CheckBoxGroup,
    ParamDropDown, PrimaryButton, SecondaryButton
} from '@wso2-enterprise/ballerina-low-code-edtior-ui-components';
import { DefaultableParam, IncludedRecordParam, RequiredParam, RestParam, STKindChecker, STNode } from '@wso2-enterprise/syntax-tree';
import debounce from "lodash.debounce";

import { StatementSyntaxDiagnostics, SuggestionItem } from '../../../../models/definitions';
import { FormEditorContext } from '../../../../store/form-editor-context';
import { FieldTitle } from '../../components/FieldTitle/fieldTitle';
import { RESOURCE_CALLER_TYPE, RESOURCE_HEADER_MAP_TYPE, RESOURCE_HEADER_PREFIX, RESOURCE_REQUEST_TYPE } from '../ResourceParamEditor';
import { createNewRecord } from '../util';

import { useStyles } from "./style";

export interface Param {
    id: number;
    name: string;
    dataType?: string;
    defaultValue?: string;
    headerName?: string;
}
export const headerParameterOption = "Header";


export enum PARAM_TYPES {
    DEFAULT = 'Query',
    PAYLOAD = 'Payload',
    REQUEST = 'Request',
    CALLER = 'Caller',
    HEADER = 'Header',
    HEADER_MAP = 'Header'
}

export interface ParamProps {
    segmentId: number;
    syntaxDiagnostics: StatementSyntaxDiagnostics[];
    model: (DefaultableParam | RequiredParam | IncludedRecordParam | RestParam);
    completions: SuggestionItem[]
    alternativeName?: string;
    isEdit: boolean;
    optionList?: string[];
    option?: string;
    isTypeReadOnly?: boolean;
    onChange: (segmentId: number, paramString: string, focusedModel?: STNode, typedInValue?: string) => void;
    onCancel?: (id?: number) => void;
}

enum ParamEditorInputTypes {
    NONE = 0,
    TYPE,
    PARAM_NAME,
    DEFAULT_VALUE
}

export function ParamEditor(props: ParamProps) {
    const {
        segmentId, syntaxDiagnostics, model, alternativeName, isEdit, option, optionList, isTypeReadOnly, onChange,
        onCancel, completions
    } = props;
    const classes = useStyles();

    // States related to syntax diagnostics
    const [currentComponentName, setCurrentComponentName] = useState<ParamEditorInputTypes>(ParamEditorInputTypes.NONE);
    const [originalSource] = useState<string>(model.source);

    const { applyModifications, syntaxTree, fullST } = useContext(FormEditorContext);
    const [newlyCreatedRecord, setNewlyCreatedRecord] = useState(undefined);

    const [inputValue, setInputValue] = useState(model?.paramName?.value.trim());
    const [typeValue, setTypeValue] = useState(model?.typeName?.source.trim());
    const [defaultParamValue, setDefaultParamValue] = useState((STKindChecker.isDefaultableParam(model) && model.expression?.source.trim()) || "");

    const [isRequired, setIsRequiredType] = useState(!STKindChecker.isOptionalTypeDesc(model?.typeName));

    // When a type is created and full ST is updated update the onChange to remove diagnostics
    useEffect(() => {
        if (newlyCreatedRecord) {
            handleTypeChange(newlyCreatedRecord);
        }
    }, [fullST]);

    useEffect(() => {
        if (model) {
            setIsRequiredType(!STKindChecker.isOptionalTypeDesc(model?.typeName));
        }
    }, [model]);

    const onTypeEditorFocus = () => {
        setCurrentComponentName(ParamEditorInputTypes.TYPE)
    }

    const onNameEditorFocus = () => {
        setCurrentComponentName(ParamEditorInputTypes.PARAM_NAME)
    }

    const onDefaultValueEditorFocus = () => {
        setCurrentComponentName(ParamEditorInputTypes.DEFAULT_VALUE)
    }

    const handleTypeChange = (value: string) => {
        if (value) {
            setIsRequiredType(!value.includes("?"));
            setTypeValue(value)
            const annotation = model.annotations?.length > 0 ? model.annotations[0].source : ''
            const paramName = model.paramName.value;
            const defaultValue = STKindChecker.isDefaultableParam(model) ? `= ${model.expression.source}` : '';
            onChange(segmentId, `${annotation} ${value} ${paramName} ${defaultValue}`, model.typeName, value);
        }

    }

    const handleNameChange = (value: string) => {
        setInputValue(value);
        const annotation = model.annotations?.length > 0 ? model.annotations[0].source : ''
        const type = model.typeName.source.trim();
        const defaultValue = STKindChecker.isDefaultableParam(model) ? `= ${model.expression.source}` : '';
        onChange(segmentId, `${annotation} ${type} ${value} ${defaultValue}`, model.paramName, value);
    }

    const handleDefaultValueChange = (value: string) => {
        setDefaultParamValue(value);
        const annotation = model.annotations?.length > 0 ? model.annotations[0].source : ''
        const type = model.typeName.source.trim();
        const paramName = model.paramName.value
        onChange(
            segmentId,
            `${annotation} ${type} ${paramName} = ${value}`,
            STKindChecker.isDefaultableParam(model) ? model.expression : undefined,
            value
        );
    }

    // const debouncedTypeChange = debounce(handleTypeChange, 800);
    // const debouncedNameChange = debounce(handleNameChange, 800);
    // const debouncedDefaultValueChange = debounce(handleDefaultValueChange, 800);

    const handleOnSelect = (value: string) => {
        const newParamString = value === PARAM_TYPES.HEADER ?
            `${RESOURCE_HEADER_PREFIX} ${model.typeName.source} ${model.paramName.value}`
            : `${model.typeName.source} ${model.paramName.value}`;
        onChange(segmentId, newParamString);
    };

    const handleOnCancel = () => {
        onChange(segmentId, originalSource);
        onCancel(segmentId);
    }

    const createRecord = (newRecord: string) => {
        if (newRecord) {
            createNewRecord(newRecord, syntaxTree, applyModifications)
            setNewlyCreatedRecord(newRecord);
        }
    }

    const handleIsRequired = (mode: string[]) => {
        if (mode.length > 0) {
            handleTypeChange(`${typeValue.replace("?", "")}`);
            setIsRequiredType(true);
        } else {
            handleTypeChange(`${typeValue.replace("?", "")}?`);
            setIsRequiredType(false);
        }
    }

    const handleOnSave = () => {
        onCancel();
    }

    return (
        <div className={classes.paramContainer}>
            {optionList && option !== PARAM_TYPES.PAYLOAD && (
                <div className={classes.paramTypeWrapper}>
                    <ParamDropDown
                        dataTestId="param-type-selector"
                        defaultValue={option}
                        placeholder={"Select Type"}
                        customProps={{ values: optionList }}
                        onChange={handleOnSelect}
                        label="Param Type"
                    />
                </div>
            )}
            {option === PARAM_TYPES.PAYLOAD && <div className={classes.payload}>Payload </div>}
            <div className={classes.paramContent}>
                {!(model.source.includes(RESOURCE_CALLER_TYPE)
                    || model.source.includes(RESOURCE_REQUEST_TYPE)
                    || model.source.includes(RESOURCE_HEADER_MAP_TYPE)) && (
                        <div className={classes.paramDataTypeWrapper}>
                            <FieldTitle title='Type' optional={false} />
                            <TypeBrowser
                                type={typeValue}
                                onChange={handleTypeChange}
                                isLoading={false}
                                recordCompletions={completions}
                                createNew={createRecord}
                                diagnostics={syntaxDiagnostics?.filter(diag => diag?.message.includes("unknown type"))}
                            />
                        </div>
                    )}
                <div className={classes.paramNameWrapper}>
                    <FieldTitle title='Name' optional={false} />
                    <LiteTextField
                        onChange={handleNameChange}
                        value={inputValue}
                        isLoading={false}
                        diagnostics={
                            (currentComponentName === ParamEditorInputTypes.PARAM_NAME && syntaxDiagnostics) ||
                            model.paramName?.viewState?.diagnosticsInRange
                        }
                    />
                </div>
                {
                    !(model.source.includes(RESOURCE_CALLER_TYPE)
                        || model.source.includes(RESOURCE_REQUEST_TYPE)
                        || model.source.includes(RESOURCE_HEADER_MAP_TYPE)) && (
                        <div className={classes.paramNameWrapper}>
                            <FieldTitle title='Default Value' optional={true} />
                            <LiteTextField
                                onChange={handleDefaultValueChange}
                                value={defaultParamValue}
                                isLoading={false}
                                diagnostics={
                                    (currentComponentName === ParamEditorInputTypes.DEFAULT_VALUE && syntaxDiagnostics) ||
                                    model.paramName?.viewState?.diagnosticsInRange
                                }
                            />
                        </div>
                    )
                }
            </div>
            {option == PARAM_TYPES.DEFAULT &&
                <div className={classes.paramContent}>
                    <CheckBoxGroup
                        values={["Is Required"]}
                        defaultValues={isRequired ? ["Is Required"] : []}
                        onChange={handleIsRequired}
                    />
                </div>
            }
            <div className={classes.btnContainer}>
                <SecondaryButton
                    text="Cancel"
                    fullWidth={false}
                    onClick={handleOnCancel}
                    className={classes.actionBtn}
                />
                <PrimaryButton
                    dataTestId={"path-segment-add-btn"}
                    text={"Save"}
                    disabled={
                        (syntaxDiagnostics && syntaxDiagnostics.length > 0)
                        || STKindChecker.isDefaultableParam(model) && model.expression?.viewState?.diagnosticInRange?.length > 0
                        || model.paramName?.viewState?.diagnosticsInRange?.length > 0
                        || model.typeName?.viewState?.diagnosticsInRange?.length > 0
                    }
                    fullWidth={false}
                    onClick={handleOnSave}
                    className={classes.actionBtn}
                />
            </div>
        </div >
    );
}
