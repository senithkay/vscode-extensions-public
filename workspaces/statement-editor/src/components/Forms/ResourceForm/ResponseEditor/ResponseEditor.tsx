/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: jsx-no-multiline-js

import React, { useContext, useEffect, useState } from 'react';

import { TextField } from '@material-ui/core';
import Autocomplete, { AutocompleteInputChangeReason, AutocompleteRenderInputParams } from '@material-ui/lab/Autocomplete';
import { LiteExpressionEditor, LiteTextField, TypeBrowser } from '@wso2-enterprise/ballerina-expression-editor';
import { ResponseCode } from '@wso2-enterprise/ballerina-low-code-edtior-commons';
import {
    CheckBoxGroup,
    ParamDropDown, PrimaryButton, SecondaryButton
} from '@wso2-enterprise/ballerina-low-code-edtior-ui-components';
import { ModulePart, NodePosition } from '@wso2-enterprise/syntax-tree';
import debounce from 'lodash.debounce';

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
    onCancel?: (revertChange?: boolean) => void;
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
        segmentId, syntaxDiagnostics, model, option, optionList, onChange,
        onCancel, completions, httpMethodName
    } = props;
    const classes = useStyles();
    const subTypeText = "Define a name record for the return type";

    const { applyModifications, syntaxTree, fullST } = useContext(FormEditorContext);

    const [newlyCreatedRecord, setNewlyCreatedRecord] = useState(undefined);

    // When a type is created and full ST is updated update the onChange to remove diagnostics
    useEffect(() => {
        if (newlyCreatedRecord) {
            const newRecord = `${newlyCreatedRecord}${isArrayType ? '[]' : ''}`
            handleTypeChange(newRecord);
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

    const defaultValue = optionList.find(item =>
        withTypeModelValue ?
            item.source === withTypeModelValue :
            (item.source === model || model.includes("error") && item.code === 500)
    );

    const selectedMethodResponse = httpMethodName && httpMethodName === "POST" ? optionsListString[3] : optionsListString[0];

    const [response, setResponse] = useState<string>(defaultValue ? `${defaultValue.title}` : selectedMethodResponse);


    const [typeValue, setTypeValue] = useState<string>(withTypeValue ? withTypeValue : (model.includes("http") ? "" : model));

    const [anonymousValue, setAnonymousValue] = useState<string>("");
    const [subType, setSubType] = useState<boolean>(false);
    const [isArrayType, setIsArrayType] = useState<boolean>(false);


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
        setTypeValue(value);
        setIsArrayType(value.includes("[]"));
        onChange(segmentId, 200, value);
    }

    const debouncedOnChange = debounce(handleTypeChange, 600);

    const handleNameChange = (value: string) => {
        setAnonymousValue(value.replace(/\s/g, ''));
    }

    const handleOnSelect = (_: any, value: string) => {
        setResponse(value);
    };

    const handleOnCancel = () => {
        onCancel(true);
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
                let newResponse = `record {|*${responseCode.source}; ${typeValue} body;|}`;
                if (typeValue.includes("error")) {
                    newResponse = typeValue;
                }
                const typeResponse = responseCode.code === Number(option) ? typeValue : newResponse;
                onChange(segmentId, responseCode.code, typeResponse);
            }
        } else {
            const responseCode = optionList.find(item => item.title === response);
            onChange(segmentId, responseCode.code);
        }
        onCancel();
    }

    const handleSubTypeCreation = (mode: string[]) => {
        if (mode.length > 0) {
            const responseCode = optionList.find(item => item.title === response);
            const responseName = responseCode.source.split(":")[1];
            const nameValue = `${responseName}${typeValue}`;
            setAnonymousValue(nameValue.replace(/\[\]/g, ""));
            setSubType(true);
        } else {
            setSubType(false);
            setAnonymousValue("");
        }
    }

    const subTypeEditor = (
        <>
            <LiteTextField
                value={anonymousValue}
                isLoading={false}
                onChange={handleNameChange}
                diagnostics={[]}
            />
        </>
    )

    const createRecord = (newRecord: string) => {
        if (newRecord) {
            createNewRecord(newRecord, syntaxTree, applyModifications)
            setNewlyCreatedRecord(newRecord);
        }
    }

    const renderInput = (params: AutocompleteRenderInputParams) => {
        return <TextField className={classes.searchList} {...params} />;
    };

    return (
        <div className={classes.paramContainer}>
            <div className={classes.paramContent}>

                <div className={classes.paramDataTypeWrapper}>
                    <FieldTitle title='Select Code' optional={false} />
                    <Autocomplete
                        disablePortal={true}
                        id="param-type-selector"
                        options={optionsListString}
                        defaultValue={response}
                        onChange={handleOnSelect}
                        renderInput={renderInput}
                    />
                </div>

                <div className={classes.paramTypeWrapper}>
                    <FieldTitle title='Type' optional={true} />
                    <TypeBrowser
                        type={typeValue}
                        onChange={debouncedOnChange}
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
                        values={[subTypeText]}
                        defaultValues={subType ? [subTypeText] : []}
                        onChange={handleSubTypeCreation}
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
