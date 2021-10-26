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

import CheckBoxGroup from "../../../../../FormFieldComponents/CheckBox";
import { PrimaryButton } from "../../../../../FormFieldComponents/Button/PrimaryButton";
import { SecondaryButton } from "../../../../../FormFieldComponents/Button/SecondaryButton";
import { SelectDropdownWithButton } from "../../../../../FormFieldComponents/DropDown/SelectDropdownWithButton";
import { ReturnType } from "../../types";
import { returnTypes } from "../../util";

import { useStyles } from './style';

interface PathSegmentEditorProps {
    id?: number;
    showDefaultError?: boolean;
    segment?: ReturnType,
    onSave?: (segment: ReturnType) => void;
    onCancel?: () => void;
}

export function ReturnTypeSegmentEditor(props: PathSegmentEditorProps) {
    const { segment, showDefaultError, onSave, id, onCancel } = props;
    const classes = useStyles();

    const initValue: ReturnType = segment ? { ...segment } : {
        id: id ? id : 0,
        type: showDefaultError ? "error" : "",
        isOptional: false
    };
    const [segmentState, setSegmentState] = useState<ReturnType>(initValue);

    const onChangeSegmentType = (text: any) => {
        setSegmentState({
            ...segmentState,
            type: text
        });
    };

    const onChangeSegmentOptional = (text: any) => {
        let isOptional = false
        if (text.find((item: string) => item === "Is Optional")) {
            isOptional = true;
        }
        setSegmentState({
            ...segmentState,
            isOptional
        });
    };

    const handleOnSave = () => {
        onSave(segmentState);
    };

    return (
        <div className={classes.returnTypeEditorWrap}>
            <div>
                <Grid container={true} spacing={1}>
                    <Grid item={true} xs={5}>
                        <div className={classes.labelOfInputs}>
                            Type
                        </div>
                    </Grid>
                </Grid>
                <Grid container={true} item={true} spacing={2}>
                    <Grid item={true} xs={6}>
                        <SelectDropdownWithButton
                            dataTestId="api-return-type"
                            defaultValue={segmentState?.type === "error" ? "" : segmentState?.type}
                            customProps={
                                {
                                    values: returnTypes,
                                    disableCreateNew: true,
                                }
                            }
                            onChange={onChangeSegmentType}
                        />
                    </Grid>
                    <Grid item={true} xs={6}>
                        <CheckBoxGroup values={["Is Optional"]} defaultValues={[segmentState.isOptional ? "Is Optional" : ""]} onChange={onChangeSegmentOptional} />
                    </Grid>
                </Grid>
                <Grid container={true} item={true} spacing={2}>
                    <Grid item={true} xs={12}>
                        <div className={classes.btnContainer}>
                            <SecondaryButton
                                text="Cancel"
                                fullWidth={false}
                                onClick={onCancel}
                                className={classes.actionBtn}
                            />
                            <PrimaryButton
                                dataTestId={"api-return-save-btn"}
                                text={"Add"}
                                disabled={false}
                                fullWidth={false}
                                onClick={handleOnSave}
                            />
                        </div>
                    </Grid>
                </Grid>
            </div>
        </div>
    );
}
