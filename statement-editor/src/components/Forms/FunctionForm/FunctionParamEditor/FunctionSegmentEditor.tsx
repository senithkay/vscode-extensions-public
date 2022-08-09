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
import React, { useEffect, useState } from "react";

import { Grid } from "@material-ui/core";
import { LiteExpressionEditor } from "@wso2-enterprise/ballerina-expression-editor";
import { PrimaryButton, SecondaryButton } from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";
import {
    DefaultableParam,
    IncludedRecordParam,
    RequiredParam,
    RestParam
} from "@wso2-enterprise/syntax-tree";
import debounce from "lodash.debounce";

import { StatementSyntaxDiagnostics, SuggestionItem } from "../../../../models/definitions";

import { FunctionParam } from "./FunctionParamItem";
import { useStyles } from './style';

interface FunctionParamSegmentEditorProps {
    param?: (DefaultableParam | IncludedRecordParam | RequiredParam | RestParam);
    id?: number;
    segment?: FunctionParam,
    onSave?: (segment: FunctionParam) => void;
    onUpdate?: (segment: FunctionParam) => void;
    onChange?: (segment: FunctionParam) => void;
    syntaxDiag?: StatementSyntaxDiagnostics[];
    onCancel?: () => void;
    isEdit?: boolean;
    completions?: SuggestionItem[];
}

export function FunctionParamSegmentEditor(props: FunctionParamSegmentEditorProps) {
    const { param, segment, onSave, onUpdate, onChange, id, onCancel, syntaxDiag, isEdit, completions } = props;
    const classes = useStyles();
    const initValue: FunctionParam = segment ? { ...segment } : {
        id: id ? id : 0,
        name: "name",
        type: "string"
    }

    const [segmentType, setSegmentType] = useState<string>(param?.typeName?.source.trim() || "string");
    const [segmentName, setSegmentName] = useState<string>(param?.paramName?.value.trim() || "name");

    // States related to syntax diagnostics
    const [currentComponentName, setCurrentComponentName] = useState<string>("");

    const handleOnSave = () => {
        onSave({
            ...initValue,
            name: segmentName,
            type: segmentType
        });
    };

    const handleOnUpdate = () => {
        onUpdate({
            ...initValue,
            name: segmentName,
            type: segmentType
        });
    };

    const onTypeEditorFocus = () => {
        setCurrentComponentName("Type");
    }

    const handleOnTypeChange = (value: string) => {
        setSegmentType(value);
        onChange({
            ...initValue,
            name: segmentName,
            type: value
        });
    };
    const debouncedTypeChange = debounce(handleOnTypeChange, 1000);

    const onNameEditorFocus = () => {
        setCurrentComponentName("Name");
    }

    const handleOnNameChange = (value: string) => {
        setSegmentName(value);
        onChange({
            ...initValue,
            name: value,
            type: segmentType
        });
    };
    const debouncedNameChange = debounce(handleOnNameChange, 1000);

    return (
        <div className={classes.functionParamEditorWrap} >
            <div>
                <Grid container={true} spacing={1}>
                    <Grid item={true} xs={5}>
                        <div className={classes.labelOfInputs}>
                            Type
                        </div>
                    </Grid>
                    <Grid item={true} xs={7}>
                        <div className={classes.labelOfInputs}>
                            Name
                        </div>
                    </Grid>
                </Grid>
                <Grid container={true} item={true} spacing={2}>
                    <Grid item={true} xs={5}>
                        <LiteExpressionEditor
                            testId={"function-param-type"}
                            diagnostics={(syntaxDiag && currentComponentName === "Type"
                                && syntaxDiag) || param?.typeName?.viewState?.diagnosticsInRange}
                            defaultValue={segmentType}
                            onChange={debouncedTypeChange}
                            onFocus={onTypeEditorFocus}
                            completions={completions}
                        />
                    </Grid>
                    <Grid item={true} xs={7}>
                        <LiteExpressionEditor
                            testId={"function-param-name"}
                            diagnostics={(syntaxDiag && currentComponentName === "Name"
                                && syntaxDiag) || param?.paramName?.viewState?.diagnosticsInRange}
                            defaultValue={segmentName}
                            onChange={debouncedNameChange}
                            onFocus={onNameEditorFocus}
                            completions={completions}
                        />
                    </Grid>

                </Grid>
                <Grid container={true} item={true} spacing={2}>
                    <Grid item={true} xs={12}>
                        <div className={classes.btnContainer}>
                            <SecondaryButton
                                text="Cancel"
                                fullWidth={false}
                                onClick={onCancel}
                            />
                            <PrimaryButton
                                dataTestId={"param-save-btn"}
                                text={onUpdate ? "Update" : " Add"}
                                disabled={
                                    (syntaxDiag?.length > 0)
                                    || (param?.viewState?.diagnosticsInRange?.length > 0)
                                    || segmentName.length === 0
                                    || segmentType.length === 0
                                }
                                fullWidth={false}
                                onClick={onUpdate ? handleOnUpdate : handleOnSave}
                            />
                        </div>
                    </Grid>
                </Grid>
            </div>
        </div>
    );
}
