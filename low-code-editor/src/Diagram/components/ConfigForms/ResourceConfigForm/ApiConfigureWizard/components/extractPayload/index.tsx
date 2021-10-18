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
import React, { useContext, useEffect, useState } from "react";

import { Grid } from "@material-ui/core";

import { Context } from "../../../../../../../Contexts/Diagram";
import { SelectDropdownWithButton } from "../../../../../Portals/ConfigForm/Elements/DropDown/SelectDropdownWithButton";
import { FormTextInput } from "../../../../../Portals/ConfigForm/Elements/TextField/FormTextInput";
import { checkVariableName } from "../../../../../Portals/utils";
import { Payload } from "../../types";
import { convertPayloadStringToPayload, payloadTypes } from "../../util";

import { useStyles } from './style';

interface PayloadEditorProps {
    payload?: string,
    disabled?: boolean,
    onChange?: (segment: Payload) => void;
    onError: (isError?: boolean) => void;
}

export function PayloadEditor(props: PayloadEditorProps) {
    const { payload, disabled, onChange, onError } = props;
    const { props: { stSymbolInfo } } = useContext(Context);
    const segment: Payload = convertPayloadStringToPayload(payload ? payload : "");

    const classes = useStyles();
    const initValue: Payload = segment.type !== "" && segment.type !== "" ? { ...segment } : {
        name: "payload",
        type: "json"
    };

    const payloadTypeArray: string[] = payloadTypes;
    if (!payloadTypeArray.includes(initValue.type)) {
        payloadTypeArray.push(initValue.type);
    }

    const [segmentState, setSegmentState] = useState<Payload>(initValue);

    const [defaultPayloadVarName, setDefaultPayloadVarName] = useState<string>(segmentState.name);
    const [payloadVarNameError, setPayloadVarNameError] = useState<string>("");

    useEffect(() => {
        if (disabled) {
            onError(false);
            setPayloadVarNameError("");
        } else {
            const validPayload = validatePayloadNameValue(segmentState.name);
            onError(!validPayload);
        }
    }, [disabled]);

    const onChangeSegmentType = (text: string) => {
        const payloadSegment: Payload = {
            ...segmentState,
        };
        payloadSegment.type = text;
        setSegmentState(payloadSegment);
        if (onChange) {
            onChange(payloadSegment);
        }
    };

    const onChangeSegmentName = (text: string) => {
        const payloadSegment: Payload = {
            ...segmentState,
        };
        payloadSegment.name = text;
        setSegmentState(payloadSegment);
        if (onChange) {
            onChange(payloadSegment);
        }
    };

    const validatePayloadNameValue = (value: string) => {
        const varValidationResponse = checkVariableName("payload name", value,
            defaultPayloadVarName, stSymbolInfo);
        setPayloadVarNameError(varValidationResponse.message);
        if (varValidationResponse?.error) {
            onError(true);
            return false;
        }
        onError(false);
        return true;
    };

    return (
        <div className={classes.segmentEditorWrap}>
            <div>
                <Grid container={true} spacing={1}>
                    <Grid container={true} item={true} spacing={2}>
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
                                disabled={disabled}
                                defaultValue={segmentState?.type ? segmentState?.type : "json"}
                                customProps={{values: payloadTypeArray, disableCreateNew: true}}
                                onChange={onChangeSegmentType}
                            />
                        </Grid>
                        <Grid item={true} xs={7}>
                            <FormTextInput
                                dataTestId="api-extract-segment"
                                disabled={disabled}
                                defaultValue={segmentState?.name}
                                customProps={{validate: validatePayloadNameValue}}
                                onChange={onChangeSegmentName}
                                errorMessage={payloadVarNameError}
                            />
                        </Grid>
                    </Grid>
                </Grid>
            </div>
        </div>
    );
}
