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

import { LiteTextField, TypeBrowser } from '@wso2-enterprise/ballerina-expression-editor';
import {
    CheckBoxGroup,
    ParamDropDown, PrimaryButton, SecondaryButton
} from '@wso2-enterprise/ballerina-low-code-edtior-ui-components';
import { STNode } from '@wso2-enterprise/syntax-tree';
import debounce from "lodash.debounce";

import { StatementSyntaxDiagnostics, SuggestionItem } from '../../../../models/definitions';
import { FormEditorContext } from '../../../../store/form-editor-context';
import { FieldTitle } from '../../components/FieldTitle/fieldTitle';
import { RESOURCE_CALLER_TYPE, RESOURCE_HEADER_MAP_TYPE, RESOURCE_HEADER_PREFIX, RESOURCE_REQUEST_TYPE } from '../ResourceParamEditor';
import { createNewRecord } from '../util';

import { useStyles } from "./style";
import { ResourceParam } from '../types';

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
    model: ResourceParam;
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
        segmentId, model, option, optionList, onChange, onCancel, completions, syntaxDiagnostics : diagnostics
    } = props;
    const classes = useStyles();

    const syntaxDiagnostics = diagnostics || model.diagnosticMsg;

    // States related to syntax diagnostics
    const [currentComponentName, setCurrentComponentName] = useState<ParamEditorInputTypes>(ParamEditorInputTypes.PARAM_NAME);
    const [originalSource] = useState<string>(model.parameterValue);

    const { applyModifications, syntaxTree, fullST } = useContext(FormEditorContext);
    const [newlyCreatedRecord, setNewlyCreatedRecord] = useState(undefined);

    // model = 'string param = "foo"'
    const [inputValue, setInputValue] = useState(model.name);
    const [typeValue, setTypeValue] = useState(model.type);
    const [defaultParamValue, setDefaultParamValue] = useState(model.default?.replace("=", "").trim());

    const [isRequired, setIsRequiredType] = useState(!model.parameterValue.includes("?"));

    // When a type is created and full ST is updated update the onChange to remove diagnostics
    useEffect(() => {
        if (newlyCreatedRecord) {
            handleTypeChange(newlyCreatedRecord);
        }
    }, [fullST]);

    useEffect(() => {
        if (model) {
            setIsRequiredType(!model.parameterValue.includes("?"));
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

    const debouncedOnChange = debounce(onChange, 600);

    const handleTypeChange = (value: string) => {
        if (value) {
            setIsRequiredType(!value.includes("?"));
            setTypeValue(value)
            const annotation = model.annotaion;
            const defaultValue = defaultParamValue ? `= ${defaultParamValue}` : '';
            debouncedOnChange(segmentId, `${annotation} ${value} ${inputValue} ${defaultValue}`);
        }
    }

    const handleNameChange = (value: string) => {
        setInputValue(value);
        const annotation = model.annotaion;
        const defaultValue = defaultParamValue ? `= ${defaultParamValue}` : '';
        if (value) {
            debouncedOnChange(segmentId, `${annotation} ${typeValue} ${value} ${defaultValue}`);
        }
    }

    const handleDefaultValueChange = (value: string) => {
        setDefaultParamValue(value);
        const annotation = model.annotaion;
        const defaultValue = value ? `= ${value}` : '';
        debouncedOnChange(segmentId, `${annotation} ${typeValue} ${inputValue} ${defaultValue}`);
    }

    const handleOnSelect = (value: string) => {
        const newParamString = value === PARAM_TYPES.HEADER ?
            `${RESOURCE_HEADER_PREFIX} ${typeValue} ${inputValue}`
            : `${typeValue} ${inputValue}`;
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
        const annotation = model.annotaion;
        let paramStringValue = `${annotation} ${typeValue} ${inputValue}`;
        if (defaultParamValue) {
            paramStringValue = `${annotation} ${typeValue} ${inputValue} = ${defaultParamValue}`;
        }
        onChange(segmentId, paramStringValue)
        onCancel();
    }

    let hideParamType = false;
    let subTitle = "";
    switch (option) {
        case PARAM_TYPES.CALLER:
            hideParamType = true;
            subTitle = PARAM_TYPES.CALLER;
            break;
        case PARAM_TYPES.HEADER:
            hideParamType = true;
            subTitle = PARAM_TYPES.HEADER;
            break;
        case PARAM_TYPES.REQUEST:
            hideParamType = true;
            subTitle = PARAM_TYPES.REQUEST;
            break;
        case PARAM_TYPES.PAYLOAD:
            hideParamType = true;
            subTitle = PARAM_TYPES.PAYLOAD;
            break;
        default:
            hideParamType = false;
            subTitle = "";
    }

    return (
        <div className={classes.paramContainer}>
            {hideParamType && <div className={classes.payload}> {subTitle} </div>}
            {optionList && !hideParamType && (
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
            <div className={classes.paramContent}>
                {!(model.parameterValue.includes(RESOURCE_CALLER_TYPE)
                    || model.parameterValue.includes(RESOURCE_REQUEST_TYPE)
                    || model.parameterValue.includes(RESOURCE_HEADER_MAP_TYPE)) && (
                        <div className={classes.paramDataTypeWrapper}>
                            <FieldTitle title='Type' optional={false} />
                            <TypeBrowser
                                type={typeValue}
                                onChange={handleTypeChange}
                                isLoading={false}
                                recordCompletions={completions}
                                createNew={createRecord}
                                diagnostics={syntaxDiagnostics?.filter(diag =>
                                    diag?.message.includes(typeValue) && !diag?.message.includes("expected")
                                )}
                            />
                        </div>
                    )}
                <div className={classes.paramNameWrapper}>
                    <FieldTitle title='Name' optional={false} />
                    <LiteTextField
                        onChange={handleNameChange}
                        value={inputValue}
                        isLoading={false}
                        onFocus={onNameEditorFocus}
                        diagnostics={syntaxDiagnostics?.filter(diag => diag?.message.includes(inputValue))}
                    />
                </div>
                {
                    !(model.parameterValue.includes(RESOURCE_CALLER_TYPE)
                        || model.parameterValue.includes(RESOURCE_REQUEST_TYPE)
                        || model.parameterValue.includes(RESOURCE_HEADER_MAP_TYPE)) && (
                        <div className={classes.paramNameWrapper}>
                            <FieldTitle title='Default Value' optional={true} />
                            <LiteTextField
                                onChange={handleDefaultValueChange}
                                value={defaultParamValue}
                                isLoading={false}
                                onFocus={onDefaultValueEditorFocus}
                                diagnostics={
                                    defaultParamValue &&
                                    syntaxDiagnostics?.filter(diag => diag?.message.includes("expected") || diag?.message.includes(defaultParamValue))
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
            {
                model.parameterValue.includes(RESOURCE_CALLER_TYPE)
                && syntaxDiagnostics?.filter(diag => diag?.message.includes("Caller"))
                &&
                <div className={classes.invalidCode}>
                    {syntaxDiagnostics[0]?.message}
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
                    }
                    fullWidth={false}
                    onClick={handleOnSave}
                    className={classes.actionBtn}
                />
            </div>
        </div >
    );
}
