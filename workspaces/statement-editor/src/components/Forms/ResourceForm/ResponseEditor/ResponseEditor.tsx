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

import { LiteExpressionEditor } from '@wso2-enterprise/ballerina-expression-editor';
import { STModification } from '@wso2-enterprise/ballerina-low-code-edtior-commons';
import {
    CheckBoxGroup,
    ParamDropDown, PrimaryButton, SecondaryButton
} from '@wso2-enterprise/ballerina-low-code-edtior-ui-components';
import { DefaultableParam, IncludedRecordParam, ModulePart, NodePosition, RequiredParam, RestParam, STKindChecker, STNode } from '@wso2-enterprise/syntax-tree';
import debounce from "lodash.debounce";

import { StatementSyntaxDiagnostics, SuggestionItem } from '../../../../models/definitions';
import { FormEditorContext } from '../../../../store/form-editor-context';
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
    { code: 100, source: "Default" },
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

    const { newlyCreatedRecord, handleShowRecordEditor, applyModifications, syntaxTree } = useContext(FormEditorContext);


    // States related to syntax diagnostics
    const [currentComponentName, setCurrentComponentName] = useState<ParamEditorInputTypes>(ParamEditorInputTypes.NONE);

    const optionsListString = optionList.map(item => item.code === 100 ? `${item.source}` : `${item.code}`);

    // record {|*http:Created; PersonAccount body;|}
    const withType = model.includes("body;") ? model.split(";")[1] : "";
    const withTypeModel = model.includes("body;") ? model.split(";")[0] : "";


    //  " PersonAccount body"
    const withTypeValue = withType.trim().split(" ")[0];

    // "record {|*http:Created"
    const withTypeModelValue = withTypeModel.split("*")[1];

    const defaultValue = optionList.find(item => withTypeModelValue ? item.source === withTypeModelValue : item.source === model);

    // const [originalSource] = useState<string>(defaultValue ? `${defaultValue.code}-${defaultValue.source}` : "");

    const [response, setResponse] = useState<string>(defaultValue ? `${defaultValue.code}` : optionsListString[0]);


    const [typeValue, setTypeValue] = useState<string>(withTypeValue ? withTypeValue : (model.includes("http") ? "" : model));

    const [anonymousValue, setAnonymousValue] = useState<string>("");
    const [subType, setSubType] = useState<boolean>(false);


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
        setAnonymousValue(value);
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

    function createPropertyStatement(property: string, targetPosition?: NodePosition,
                                     isLastMember?: boolean): STModification {
        const propertyStatement: STModification = {
            startLine: targetPosition ? targetPosition.startLine : 0,
            startColumn: isLastMember ? targetPosition.endColumn : 0,
            endLine: targetPosition ? targetPosition.startLine : 0,
            endColumn: isLastMember ? targetPosition.endColumn : 0,
            type: "PROPERTY_STATEMENT",
            config: {
                "PROPERTY": property,
            }
        };

        return propertyStatement;
    }

    const handleOnSave = () => {
        if (typeValue) {
            if (response === 'Default') {
                onChange(segmentId, response, typeValue);
            } else {
                if (anonymousValue) {
                    const responseCode = optionList.find(item => item.code.toString() === response);
                    const newResponse = `type ${anonymousValue} record {|*${responseCode.source}; ${typeValue} body;|};`;
                    const servicePosition = (syntaxTree as ModulePart);
                    const lastMember: NodePosition = servicePosition.position;
                    const lastMemberPosition: NodePosition = {
                        endColumn: 0,
                        endLine: lastMember.endLine + 1,
                        startColumn: 0,
                        startLine: lastMember.endLine + 1
                    }
                    applyModifications([
                        createPropertyStatement(newResponse, lastMemberPosition, false)
                    ]);
                    onChange(segmentId, 'Default', anonymousValue);
                } else {
                    const responseCode = optionList.find(item => item.code.toString() === response);
                    const newResponse = `record {|*${responseCode.source}; ${typeValue} body;|}`;
                    onChange(segmentId, response, newResponse);
                }
            }
        } else {
            onChange(segmentId, response);
        }
        onCancel();
    }

    // When a type is created
    useEffect(() => {
        if (newlyCreatedRecord) {
            handleTypeChange(newlyCreatedRecord);
        }
    }, newlyCreatedRecord);

    const handleListenerDefModeChange = async (mode: string[]) => {
        setSubType(mode.length > 0);
    }

    const subTypeEditor = (
        <>
            <FieldTitle title='Subtype Record Name' optional={true} />
            <LiteExpressionEditor
                testId="anonymous-record-name"
                defaultValue={anonymousValue}
                onChange={handleNameChange}
                disabled={false}
                completions={completions}
            />
        </>
    )

    return (
        <div className={classes.paramContainer}>
            <div className={classes.paramContent}>

                <div className={classes.paramDataTypeWrapper}>
                    <ParamDropDown
                        dataTestId="param-type-selector"
                        placeholder={"Select Code"}
                        customProps={{ values: optionsListString }}
                        defaultValue={response}
                        onChange={handleOnSelect}
                        label="HTTP Response Code"
                    />
                </div>

                <div className={classes.paramTypeWrapper}>
                    <FieldTitle title='Type' optional={false} />
                    <LiteExpressionEditor
                        testId="return-type"
                        defaultValue={typeValue}
                        onChange={handleTypeChange}
                        disabled={false}
                        completions={completions}
                        showRecordEditorButton={true}
                        handleShowRecordEditor={handleShowRecordEditor}
                    />
                </div>




            </div>

            <div className={classes.paramContent}>
                <div className={classes.anonyWrapper}>

                    <CheckBoxGroup
                        className={classes.subType}
                        values={["Define Subtype"]}
                        defaultValues={subType ? ["Define Subtype"] : []}
                        onChange={handleListenerDefModeChange}
                    />

                    {subType && subTypeEditor}
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
