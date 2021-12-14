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
import React, { useContext, useState } from "react";

import { Grid } from "@material-ui/core";
import { PrimaryButton, SecondaryButton } from "@wso2-enterprise/ballerina-low-code-edtior-commons";

import { Context } from "../../../../../../../../Contexts/Diagram";
import { checkVariableName } from "../../../../../../Portals/utils";
import { SelectDropdownWithButton } from "../../../../../FormFieldComponents/DropDown/SelectDropdownWithButton";
import { FormTextInput } from "../../../../../FormFieldComponents/TextField/FormTextInput";
import { QueryParam } from "../../types";
import { queryParamTypes } from "../../util";

import { useStyles } from './style';

interface QueryParamSegmentEditorProps {
    id?: number;
    queryParam?: QueryParam,
    onSave?: (segment: QueryParam) => void;
    onUpdate?: (segment: QueryParam) => void;
    onCancel?: () => void;
    types?: string[];
    validateParams?: (paramName: string) => { error: boolean, message: string };
}

export function QueryParamSegmentEditor(props: QueryParamSegmentEditorProps) {
    const { queryParam, onSave, id, onCancel, onUpdate, types, validateParams } = props;
    const classes = useStyles();
    const { props: { stSymbolInfo } } = useContext(Context);
    let queryParamValue = queryParam;
    if (queryParamValue) {
        queryParamValue = {
            ...queryParamValue,
            type: "string"
        }
    }
    const initValue: QueryParam = queryParamValue ? { ...queryParamValue } : {
        id: id ? id : 0,
        name: "",
        type: "string",
    };

    const [segmentState, setSegmentState] = useState<QueryParam>(initValue);
    const [pramError, setParamError] = useState<string>("");

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

    const validateNameValue = (value: string) => {
        if (value) {
            const varValidationResponse = validateParams
                ? validateParams(value)
                : checkVariableName("query param name", value, "", stSymbolInfo);
            if (varValidationResponse?.error) {
                setParamError(varValidationResponse.message);
                return false;
            }
        }
        setParamError("");
        return true;
    };

    const handleOnSave = () => {
        onSave(segmentState);
    };

    const handleOnUpdate = () => {
        onUpdate(segmentState);
    };

    return (
        <div className={classes.queryParamEditorWrap}>
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
                        <SelectDropdownWithButton
                            dataTestId="api-query-param-type"
                            defaultValue={segmentState?.type}
                            customProps={{values: types || queryParamTypes, disableCreateNew: true}}
                            onChange={onChangeSegmentType}
                        />
                    </Grid>
                    <Grid item={true} xs={7}>
                        <FormTextInput
                            dataTestId="api-query-param-name"
                            defaultValue={segmentState?.name}
                            customProps={{validate: validateNameValue}}
                            onChange={onChangeSegmentName}
                            errorMessage={pramError}
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
                                disabled={!segmentState.name || !segmentState.type || segmentState?.name === "" || segmentState?.type === "" || pramError !== ""}
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
