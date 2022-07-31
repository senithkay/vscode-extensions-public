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

import React, { useState } from 'react';

import { LiteExpressionEditor } from '@wso2-enterprise/ballerina-expression-editor';
import {
    ParamDropDown, PrimaryButton, SecondaryButton
} from '@wso2-enterprise/ballerina-low-code-edtior-ui-components';
import { DefaultableParam, IncludedRecordParam, RequiredParam, RestParam, STKindChecker } from '@wso2-enterprise/syntax-tree';
import debounce from "lodash.debounce";

import { StatementSyntaxDiagnostics, SuggestionItem } from '../../../../models/definitions';
import { FieldTitle } from '../../components/FieldTitle/fieldTitle';
import { RESOURCE_CALLER_TYPE, RESOURCE_HEADER_MAP_TYPE, RESOURCE_HEADER_PREFIX, RESOURCE_REQUEST_TYPE } from '../ResourceParamEditor';

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
    HEADER = 'Header'
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
    onChange: (segmentId: number, paramString: string) => void;
    onCancel?: () => void;
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
        onCancel
    } = props;
    console.log('>>> parameditor model', model);

    const classes = useStyles();

    // const [paramDataType, setParamDataType] = useState<string>(dataType);
    // const [paramName, setParamName] = useState<string>(name);
    // const [paramHeaderName, setParamHeaderName] = useState<string>(paramName);
    // const [paramDefaultValue, setParamDefaultValue] = useState<string>(defaultValue);
    // const [selectedOption, setSelectedOption] = useState<string>(option);
    // const [isHeaderConfigInProgress, setIsHeaderConfigInProgress] = useState<boolean>(!!hName);
    // // States related to syntax diagnostics
    const [currentComponentName, setCurrentComponentName] = useState<ParamEditorInputTypes>(ParamEditorInputTypes.NONE);

    // const isTypeVisible = dataTypeReqOptions ? dataTypeReqOptions.includes(selectedOption) : true;
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
        const annotation = model.annotations?.length > 0 ? model.annotations[0].source : ''
        const paramName = model.paramName.value;
        const defaultValue = STKindChecker.isDefaultableParam(model) ? `= ${model.expression.source}` : '';
        onChange(segmentId, `${annotation} ${value} ${paramName} ${defaultValue}`);

    }

    const handleNameChange = (value: string) => {
        const annotation = model.annotations?.length > 0 ? model.annotations[0].source : ''
        const type = model.typeName.source.trim();
        const defaultValue = STKindChecker.isDefaultableParam(model) ? `= ${model.expression.source}` : '';
        onChange(segmentId, `${annotation} ${type} ${value} ${defaultValue}`);
    }

    const handleDefaultValueChange = (value: string) => {
        const annotation = model.annotations?.length > 0 ? model.annotations[0].source : ''
        const type = model.typeName.source.trim();
        const paramName = model.paramName.value
        onChange(segmentId, `${annotation} ${type} ${paramName} = ${value}`);
    }

    const debouncedTypeChange = debounce(handleTypeChange, 800);
    const debouncedNameChange = debounce(handleNameChange, 800);
    const debouncedDefaultValueChange = debounce(handleDefaultValueChange, 800);


    // const handleNameChange = () => {
    // setCurrentComponentName("Name");
    // if (optionList) {
    //     onChange({
    //         id, name: value, dataType: paramDataType, headerName: paramHeaderName,
    //         defaultValue: paramDefaultValue
    //     }, selectedOption);
    // } else {
    //     onChange({
    //         id, name: value, dataType: paramDataType, headerName: paramHeaderName,
    //         defaultValue: paramDefaultValue
    //     });
    // }
    // };

    const handleHeaderNameChange = () => {
        // setParamHeaderName(value);
        // setCurrentComponentName("HeaderName");
        // if (optionList) {
        //     onChange({
        //         id, name: paramName, dataType: paramDataType, headerName: value, defaultValue:
        //             paramDefaultValue
        //     }, selectedOption);
        // } else {
        //     onChange({
        //         id, name: paramName, dataType: paramDataType, headerName: value, defaultValue:
        //             paramDefaultValue
        //     });
        // }
    };

    // const handleTypeChange = () => {
    // setCurrentComponentName("Type");
    // if (optionList) {
    //     onChange({
    //         id, name: paramName, dataType: value, headerName: paramHeaderName,
    //         defaultValue: paramDefaultValue
    //     }, selectedOption);
    // } else {
    //     onChange({
    //         id, name: paramName, dataType: value, headerName: paramHeaderName, defaultValue:
    //             paramDefaultValue
    //     });
    // }
    // };

    // const handleDefaultValueChange = () => {
    // setParamDefaultValue(value);
    // setCurrentComponentName("DefaultValue");
    // if (optionList) {
    //     onChange({ id, name: paramName, dataType: paramDataType, headerName, defaultValue: value },
    //         selectedOption);
    // } else {
    //     onChange({ id, name: paramName, dataType: paramDataType, headerName, defaultValue: value });
    // }
    // };

    const handleOnSelect = (value: string) => {
        const newParamString = value === PARAM_TYPES.HEADER ?
            `${RESOURCE_HEADER_PREFIX} ${model.typeName.source} ${model.paramName.value}`
            : `${model.typeName.source} ${model.paramName.value}`;
        onChange(segmentId, newParamString);
    };

    const handleAddParam = () => {
        
    };


    // useEffect(() => {
    //     setParamDataType(dataType);
    // }, [dataType]);

    // useEffect(() => {
    //     setParamName(name);
    // }, [name]);

    // useEffect(() => {
    //     setSelectedOption(option);
    // }, [option]);

    // useEffect(() => {
    //     setParamHeaderName(hName);
    // }, [hName]);

    // useEffect(() => {
    //     setParamDefaultValue(defaultValue);
    // }, [defaultValue]);

    return (
        <div className={classes.paramContainer}>
            {optionList && (
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
                {!(model.source.includes(RESOURCE_CALLER_TYPE)
                    || model.source.includes(RESOURCE_REQUEST_TYPE)
                    || model.source.includes(RESOURCE_HEADER_MAP_TYPE)) && (
                        <div className={classes.paramDataTypeWrapper}>
                            <FieldTitle title='Type' optional={false} />
                            <LiteExpressionEditor
                                diagnostics={
                                    (currentComponentName === ParamEditorInputTypes.TYPE && syntaxDiagnostics) ||
                                    model.typeName?.viewState?.diagnosticsInRange
                                }
                                defaultValue={model?.typeName?.source.trim()}
                                onChange={debouncedTypeChange}
                                onFocus={onTypeEditorFocus}
                                disabled={false}
                            />
                        </div>
                    )}
                <div className={classes.paramNameWrapper}>
                    <FieldTitle title='Param Name' optional={false} />
                    <LiteExpressionEditor
                        diagnostics={
                            (currentComponentName === ParamEditorInputTypes.PARAM_NAME && syntaxDiagnostics) ||
                            model.paramName?.viewState?.diagnosticsInRange
                        }
                        defaultValue={model?.paramName?.value.trim()}
                        onChange={debouncedNameChange}
                        onFocus={onNameEditorFocus}
                        disabled={false}
                    />
                </div>
                <div className={classes.paramNameWrapper}>
                    <FieldTitle title='Default Value' optional={false} />
                    <LiteExpressionEditor
                        diagnostics={
                            (currentComponentName === ParamEditorInputTypes.DEFAULT_VALUE && syntaxDiagnostics)
                            || STKindChecker.isDefaultableParam(model) && model.expression?.viewState?.diagnosticInRange
                            || []
                        }
                        defaultValue={STKindChecker.isDefaultableParam(model) && model.expression?.source.trim() || ""}
                        onChange={debouncedDefaultValueChange}
                        onFocus={onDefaultValueEditorFocus}
                        disabled={false}
                    />
                </div>
            </div>
            <>
                {/* {(selectedOption === headerParameterOption && isHeaderConfigInProgress) && (
                    <div className={classes.headerNameWrapper}>
                        <FormTextInput
                            label="Header Name"
                            dataTestId="header-name"
                            defaultValue={paramHeaderName}
                            onChange={debouncedHeaderNameChange}
                            customProps={{
                                isErrored: ((syntaxDiag !== "" && currentComponentName === "HeaderName") ||
                                    (nameDiagnostics !== "" && nameDiagnostics !== undefined)),
                                optional: true
                            }}
                            errorMessage={((currentComponentName === "HeaderName" && (syntaxDiag) ? syntaxDiag : "")
                                || nameDiagnostics)}
                            onBlur={null}
                            placeholder={"Enter Header Name"}
                            size="small"
                            disabled={syntaxDiag && currentComponentName !== "HeaderName"}
                        />
                    </div>
                )} */}
            </>
            {/* {(selectedOption === headerParameterOption && !isHeaderConfigInProgress) && (
                <Button
                    data-test-id="request-add-button"
                    onClick={handleShowHeaderName}
                    className={classes.addHeaderBtn}
                    startIcon={<AddIcon />}
                    color="primary"
                    disabled={(syntaxDiag !== "") || disabled}
                >
                    If identifier not equal header name
                </Button>
            )} */}
            <div className={classes.btnContainer}>
                <SecondaryButton
                    text="Cancel"
                    fullWidth={false}
                    onClick={onCancel}
                    className={classes.actionBtn}
                />
                <PrimaryButton
                    dataTestId={"path-segment-add-btn"}
                    text={"Save"}
                    disabled={false}
                    fullWidth={false}
                    onClick={onCancel}
                    className={classes.actionBtn}
                />
            </div>
        </div >
    );
}
