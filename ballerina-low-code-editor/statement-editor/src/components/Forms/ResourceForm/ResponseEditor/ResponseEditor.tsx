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

import React, { useEffect, useState } from 'react';

import { LiteExpressionEditor } from '@wso2-enterprise/ballerina-expression-editor';
import {
    ParamDropDown, PrimaryButton, SecondaryButton
} from '@wso2-enterprise/ballerina-low-code-edtior-ui-components';
import { DefaultableParam, IncludedRecordParam, RequiredParam, RestParam, STKindChecker, STNode } from '@wso2-enterprise/syntax-tree';
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

export interface ResponseCode {
    code: number;
    source: string;
}
export const responseCodes: ResponseCode[] = [
    { code: 200, source: "http:Ok" },
    { code: 201, source: "http:Created" },
    { code: 404, source: "http:NotFound" },
    { code: 500, source: "http:InternalServerError" }
];

export interface ParamProps {
    segmentId: number;
    syntaxDiagnostics: StatementSyntaxDiagnostics[];
    model: string;
    completions: SuggestionItem[]
    alternativeName?: string;
    isEdit: boolean;
    optionList?: ResponseCode[];
    option?: string;
    isTypeReadOnly?: boolean;
    onChange: (segmentId: number, paramString: string, withType?: string) => void;
    onCancel?: () => void;
}

enum ParamEditorInputTypes {
    NONE = 0,
    TYPE,
    PARAM_NAME,
    DEFAULT_VALUE
}

export function ResponseEditor(props: ParamProps) {
    const {
        segmentId, syntaxDiagnostics, model, alternativeName, isEdit, option, optionList, isTypeReadOnly, onChange,
        onCancel, completions
    } = props;
    const classes = useStyles();

    // States related to syntax diagnostics
    const [currentComponentName, setCurrentComponentName] = useState<ParamEditorInputTypes>(ParamEditorInputTypes.NONE);

    const optionsListString = optionList.map(item => `${item.code}-${item.source}`);

    //record {|*http:Created; PersonAccount body;|}
    const withType = model.includes("body;") ? model.split(";")[1] : "";
    const withTypeModel = model.includes("body;") ? model.split(";")[0] : "";


    //  " PersonAccount body"
    const withTypeValue = withType.trim().split(" ")[0];

    // "record {|*http:Created"
    const withTypeModelValue = withTypeModel.split("*")[1];

    const defaultValue = optionList.find(item => item.source === withTypeModelValue);

    // const [originalSource] = useState<string>(defaultValue ? `${defaultValue.code}-${defaultValue.source}` : "");

    const [response, setResponse] = useState<string>(defaultValue ? `${defaultValue.code}-${defaultValue.source}` : optionsListString[0]);


    const [typeValue, setTypeValue] = useState<string>(withTypeValue);


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
        // const annotation = model.annotations?.length > 0 ? model.annotations[0].source : ''
        // const paramName = model.paramName.value;
        // const defaultValue = STKindChecker.isDefaultableParam(model) ? `= ${model.expression.source}` : '';
        setTypeValue(value);

    }

    const handleNameChange = (value: string) => {
        // const annotation = model.annotations?.length > 0 ? model.annotations[0].source : ''
        // const type = model.typeName.source.trim();
        // const defaultValue = STKindChecker.isDefaultableParam(model) ? `= ${model.expression.source}` : '';
        // onChange(segmentId, `${annotation} ${type} ${value} ${defaultValue}`, model.paramName, value);
    }

    const handleDefaultValueChange = (value: string) => {
        // const annotation = model.annotations?.length > 0 ? model.annotations[0].source : ''
        // const type = model.typeName.source.trim();
        // const paramName = model.paramName.value
        // onChange(
        //     segmentId,
        //     `${annotation} ${type} ${paramName} = ${value}`,
        //     STKindChecker.isDefaultableParam(model) ? model.expression : undefined,
        //     value
        // );
    }

    // const debouncedTypeChange = debounce(handleTypeChange, 800);
    // const debouncedNameChange = debounce(handleNameChange, 800);
    // const debouncedDefaultValueChange = debounce(handleDefaultValueChange, 800);

    const handleOnSelect = (value: string) => {
        // const newParamString = value ?
        //     `${RESOURCE_HEADER_PREFIX} ${model.typeName.source} ${model.paramName.value}`
        //     : `${model.typeName.source} ${model.paramName.value}`;
        setResponse(value);
    };

    const handleOnCancel = () => {
        onCancel();
    }


    const handleOnSave = () => {
        if (typeValue) {
            const splitResponse = response.split("-");
            const newResponse = `record {|*${splitResponse[1]}; ${typeValue} body;|}`;
            onChange(segmentId, response, newResponse);
        } else {
            onChange(segmentId, response);
        }
        onCancel();
    }


    return (
        <div className={classes.paramContainer}>
            <div className={classes.paramContent}>
                <div className={classes.paramTypeWrapper}>
                    <ParamDropDown
                        dataTestId="param-type-selector"
                        placeholder={"Select Code"}
                        customProps={{ values: optionsListString }}
                        defaultValue={response}
                        onChange={handleOnSelect}
                        label="HTTP Response Code"
                    />
                </div>

                <div className={classes.paramDataTypeWrapper}>
                    <FieldTitle title='Type' optional={true} />
                    <LiteExpressionEditor
                        testId="return-type"
                        defaultValue={typeValue}
                        onChange={handleTypeChange}
                        disabled={false}
                        completions={completions}
                    />
                </div>


            </div>
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
                    fullWidth={false}
                    onClick={handleOnSave}
                    className={classes.actionBtn}
                />
            </div>
        </div >
    );
}
