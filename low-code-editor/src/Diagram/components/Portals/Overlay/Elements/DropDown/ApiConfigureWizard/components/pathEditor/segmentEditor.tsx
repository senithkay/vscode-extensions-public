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
import React, { useContext, useEffect, useState } from "react";

import { Grid } from "@material-ui/core";

import { PrimaryButton } from "../../../../../../../../../Diagram/components/Portals/ConfigForm/Elements/Button/PrimaryButton";
import { SecondaryButton } from "../../../../../../../../../Diagram/components/Portals/ConfigForm/Elements/Button/SecondaryButton";
import CheckBoxGroup from "../../../../../../../../../Diagram/components/Portals/ConfigForm/Elements/CheckBox";
import { SelectDropdownWithButton } from "../../../../../../../../../Diagram/components/Portals/ConfigForm/Elements/DropDown/SelectDropdownWithButton";
import { FormTextInput } from "../../../../../../../../../Diagram/components/Portals/ConfigForm/Elements/TextField/FormTextInput";
import { PathSegment } from "../../types";
import { pathParamTypes } from "../../util";

import { useStyles } from './style';

interface PathSegmentEditorProps {
    id?: number;
    segment?: PathSegment,
    onSave?: (segment: PathSegment) => void;
    onCancel?: () => void;
}

export function PathSegmentEditor(props: PathSegmentEditorProps) {
    const { segment, onSave, id, onCancel } = props;
    const classes = useStyles();
    const initValue: PathSegment = segment ? { ...segment } : {
        id: id ? id : 0,
        name: "",
        isParam: false,
        type: "string"
    };

    const [segmentState, setSegmentState] = useState<PathSegment>(initValue);
    const [pathError, setPathError] = useState<string>("");

    const onChangeSegmentName = (text: string) => {
        setSegmentState({
            ...segmentState,
            name: text
        });
    };

    const onChangeSegmentType = (text: string) => {
        setSegmentState({
            ...segmentState,
            type: text
        });
    };

    const onParamCheckChange = (text: string[]) => {
        if (text) {
            setSegmentState({
                ...segmentState,
                isParam: text.length > 1
            });
        }
    };

    const validatePath = (text: string) : string => {
        const pathRegex = new RegExp("^[a-zA-Z][a-zA-Z0-9]*$");
        if (!pathRegex.test(text)) {
            return "Invalid path value";
        } else {
            return "";
        }
    };

    const validateNameValue = (value: string) => {
        if (value) {
            const pathResponse = validatePath(value);
            setPathError(pathResponse);
            return !pathResponse;
        }
        setPathError("");
        return true;
    };

    const handleOnSave = () => {
        onSave(segmentState);
    };

    return (
        <div className={classes.segmentEditorWrap}>
            <div>
                <Grid container={true} spacing={1}>
                    <Grid container={true} item={true} spacing={2}>
                        <Grid item={true} xs={7}>
                            <div className={classes.labelOfInputs}>
                                Name
                            </div>
                        </Grid>
                    </Grid>
                    <Grid container={true} item={true} spacing={2}>
                        <Grid item={true} xs={7}>
                            <FormTextInput
                                dataTestId="api-path-segment"
                                defaultValue={segmentState?.name}
                                onChange={onChangeSegmentName}
                                customProps={{
                                    validate: validateNameValue,
                                }}
                                errorMessage={pathError}
                            />
                        </Grid>
                    </Grid>
                    <Grid container={true} item={true} spacing={2}>
                        <Grid item={true} xs={7}>
                            <CheckBoxGroup values={["Is Parameter"]} defaultValues={[segmentState.isParam ? "Is Parameter" : ""]} onChange={onParamCheckChange} />
                        </Grid>
                        <Grid item={true} xs={5}>
                            <SelectDropdownWithButton
                                defaultValue={segmentState?.type}
                                disabled={!segmentState?.isParam}
                                customProps={
                                    {
                                        values: pathParamTypes,
                                        disableCreateNew: true,
                                    }
                                }
                                onChange={onChangeSegmentType}
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
                                    className={classes.actionBtn}
                                />
                                <PrimaryButton
                                    dataTestId={"custom-expression-save-btn"}
                                    text={"Add"}
                                    disabled={!segmentState.name || segmentState.name === "" || (segmentState.isParam &&
                                        (!segmentState.type || segmentState.type === "")) || pathError !== ""}
                                    fullWidth={false}
                                    onClick={handleOnSave}
                                    className={classes.actionBtn}
                                />
                            </div>
                        </Grid>
                    </Grid>
                </Grid>
            </div>
        </div>
    );
}
