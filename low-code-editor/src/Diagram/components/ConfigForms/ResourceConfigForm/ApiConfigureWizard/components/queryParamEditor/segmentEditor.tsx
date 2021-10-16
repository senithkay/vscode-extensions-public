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

import { Context } from "../../../../../../../Contexts/Diagram";
import { PrimaryButton } from "../../../../../Portals/ConfigForm/Elements/Button/PrimaryButton";
import { SecondaryButton } from "../../../../../Portals/ConfigForm/Elements/Button/SecondaryButton";
import { SelectDropdownWithButton } from "../../../../../Portals/ConfigForm/Elements/DropDown/SelectDropdownWithButton";
import { FormTextInput } from "../../../../../Portals/ConfigForm/Elements/TextField/FormTextInput";
import { checkVariableName } from "../../../../../Portals/utils";
import { QueryParam } from "../../types";
import { queryParamTypes } from "../../util";

import { useStyles } from './style';

interface PathSegmentEditorProps {
    id?: number;
    segment?: QueryParam,
    onSave?: (segment: QueryParam) => void;
    onCancel?: () => void;
    types?: string[];
}

export function QueryParamSegmentEditor(props: PathSegmentEditorProps) {
    const { segment, onSave, id, onCancel, types } = props;
    const classes = useStyles();
    const { props: { stSymbolInfo } } = useContext(Context);
    const initValue: QueryParam = segment ? { ...segment } : {
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
            const varValidationResponse = checkVariableName("query param name", value,
                "", stSymbolInfo);
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
                                text={"Add"}
                                disabled={!segmentState.name || !segmentState.type || segmentState?.name === "" || segmentState?.type === "" || pramError !== ""}
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
