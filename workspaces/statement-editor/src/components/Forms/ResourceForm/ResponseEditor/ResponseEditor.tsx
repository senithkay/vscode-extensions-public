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

import { LiteExpressionEditor, TypeBrowser } from '@wso2-enterprise/ballerina-expression-editor';
import { ResponseCode } from '@wso2-enterprise/ballerina-low-code-edtior-commons';
import {
    CheckBoxGroup,
    ParamDropDown, PrimaryButton, SecondaryButton
} from '@wso2-enterprise/ballerina-low-code-edtior-ui-components';
import { ModulePart, NodePosition } from '@wso2-enterprise/syntax-tree';

import { StatementSyntaxDiagnostics, SuggestionItem } from '../../../../models/definitions';
import { FormEditorContext } from '../../../../store/form-editor-context';
import { FieldTitle } from '../../components/FieldTitle/fieldTitle';
import { createNewRecord, createPropertyStatement } from '../util';

import { useStyles } from "./style";

export interface Param {
    id: number;
    name: string;
    dataType?: string;
    defaultValue?: string;
    headerName?: string;
}

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
    onChange: (segmentId: number, responseCode: number, withType?: string) => void;
    onCancel?: () => void;
    httpMethodName?: string;
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
        onCancel, completions, httpMethodName
    } = props;
    const classes = useStyles();

    const { applyModifications, syntaxTree, fullST } = useContext(FormEditorContext);

    const [newlyCreatedRecord, setNewlyCreatedRecord] = useState(undefined);

    // When a type is created and full ST is updated update the onChange to remove diagnostics
    useEffect(() => {
        if (newlyCreatedRecord) {
            handleTypeChange(newlyCreatedRecord);
        }
    }, [fullST]);


    // States related to syntax diagnostics
    const [currentComponentName, setCurrentComponentName] = useState<ParamEditorInputTypes>(ParamEditorInputTypes.NONE);

    const optionsListString = optionList.map(item => `${item.title}`);

    // record {|*http:Created; PersonAccount body;|}
    const withType = model.includes("body;") ? model.split(";")[1] : "";
    const withTypeModel = model.includes("body;") ? model.split(";")[0] : "";


    //  " PersonAccount body"
    const withTypeValue = withType.trim().split(" ")[0];

    // "record {|*http:Created"
    const withTypeModelValue = withTypeModel.split("*")[1];

    const defaultValue = optionList.find(item => withTypeModelValue ? item.source === withTypeModelValue : item.source === model);

    // const [originalSource] = useState<string>(defaultValue ? `${defaultValue.code}-${defaultValue.source}` : "");

    const selectedMethodResponse = httpMethodName && httpMethodName === "POST" ? optionsListString[3] : optionsListString[0];

    const [response, setResponse] = useState<string>(defaultValue ? `${defaultValue.title}` : selectedMethodResponse);


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
        if (value) {
            setTypeValue(value);
            onChange(segmentId, 200, value);
        }
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

    const handleOnSave = () => {
        if (typeValue) {
            if (anonymousValue) {
                const responseCode = optionList.find(item => item.title === response);
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
                onChange(segmentId, 200, anonymousValue);
            } else {
                const responseCode = optionList.find(item => item.title === response);
                const newResponse = `record {|*${responseCode.source}; ${typeValue} body;|}`;
                const typeResponse = responseCode.code === 200 || responseCode.code === 201 ? typeValue : newResponse;
                onChange(segmentId, responseCode.code, typeResponse);
            }
        } else {
            const responseCode = optionList.find(item => item.title === response);
            onChange(segmentId, responseCode.code);
        }
        onCancel();
    }

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
                completions={[]}
            />
        </>
    )

    const createRecord = (newRecord: string) => {
        if (newRecord) {
            createNewRecord(newRecord, syntaxTree, applyModifications)
            setNewlyCreatedRecord(newRecord);
        }
    }

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
                    <TypeBrowser
                        type={typeValue}
                        onChange={handleTypeChange}
                        isLoading={false}
                        recordCompletions={completions}
                        createNew={createRecord}
                        diagnostics={syntaxDiagnostics?.filter(diag => diag?.message.includes("unknown type"))}
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
