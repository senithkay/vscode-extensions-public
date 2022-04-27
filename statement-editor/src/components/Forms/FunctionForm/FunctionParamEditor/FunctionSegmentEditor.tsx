/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
import React, { useState } from "react";

import { Grid } from "@material-ui/core";
import { FormTextInput, PrimaryButton, SecondaryButton } from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";
import { NodePosition } from "@wso2-enterprise/syntax-tree";

import { StmtDiagnostic } from "../../../../models/definitions";
import { SimpleField } from "../../Types";

import { FunctionParam } from "./FunctionParamItem";
import { useStyles } from './style';

interface FunctionParamSegmentEditorProps {
    id?: number;
    segment?: FunctionParam,
    onSave?: (segment: FunctionParam) => void;
    onUpdate?: (segment: FunctionParam) => void;
    onChange?: (segment: FunctionParam) => void;
    syntaxDiag?: StmtDiagnostic[];
    onCancel?: () => void;
    validateParams?: (paramName: string) => { error: boolean, message: string };
    position?: NodePosition;
    isEdit?: boolean;
    paramCount?: number;
}

export function FunctionParamSegmentEditor(props: FunctionParamSegmentEditorProps) {
    const { segment, onSave, onUpdate, onChange, id, onCancel, syntaxDiag } = props;
    const classes = useStyles();
    const initValue: FunctionParam = segment ? { ...segment } : {
        id: id ? id : 0,
        name: { value: "name", isInteracted: false },
        type: { value: "string", isInteracted: false },
    };

    const [segmentType, setSegmentType] = useState<SimpleField>(segment?.type || {
        value: "string", isInteracted: false
    });
    const [segmentName, setSegmentName] = useState<SimpleField>(segment?.name || {
        value: "name", isInteracted: false
    });

    // States related to syntax diagnostics
    const [currentComponentName, setCurrentComponentName] = useState<string>("");

    const typeError = "Type Error";
    const nameError = "Name Error";

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

    const handleOnTypeChange = (value: string) => {
        setSegmentType({value, isInteracted: true});
        setCurrentComponentName("Type");
        onChange({
            ...initValue,
            name: {value: segmentName.value, isInteracted: true},
            type: {value, isInteracted: true}
        });
    };
    const handleOnNameChange = (value: string) => {
        setSegmentName({value, isInteracted: true});
        setCurrentComponentName("Name");
        onChange({
            ...initValue,
            name: {value, isInteracted: true},
            type: {value: segmentType.value, isInteracted: true}
        });
    };

    return (
        <div className={classes.functionParamEditorWrap}>
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
                        <FormTextInput
                            dataTestId="api-function-param-type"
                            defaultValue={segmentType.value}
                            onChange={handleOnTypeChange}
                            customProps={{
                                optional: true,
                                isErrored: (syntaxDiag !== undefined && currentComponentName === "Type")
                            }}
                            errorMessage={typeError}
                            disabled={(syntaxDiag?.length > 0) && currentComponentName !== "Type"}
                        />
                    </Grid>
                    <Grid item={true} xs={7}>
                        <FormTextInput
                            dataTestId="api-function-param-name"
                            defaultValue={segmentName.value}
                            onChange={handleOnNameChange}
                            customProps={{
                                optional: true,
                                isErrored: (syntaxDiag !== undefined && currentComponentName === "Name")
                            }}
                            errorMessage={nameError}
                            disabled={(syntaxDiag?.length > 0) && currentComponentName !== "Name"}
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
                                dataTestId={"custom-expression-save-btn"}
                                text={onUpdate ? "Update" : " Add"}
                                disabled={!segmentName || !segmentType || (syntaxDiag?.length === 0)}
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
