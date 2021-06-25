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

import { Checkbox, Grid } from "@material-ui/core";

import { ButtonWithIcon } from "../../../../../../../../../Diagram/components/Portals/ConfigForm/Elements/Button/ButtonWithIcon";
import { SelectDropdownWithButton } from "../../../../../../../../../Diagram/components/Portals/ConfigForm/Elements/DropDown/SelectDropdownWithButton";
import { FormTextInput } from "../../../../../../../../../Diagram/components/Portals/ConfigForm/Elements/TextField/FormTextInput";
import { Payload } from "../../types";
import { convertPayloadStringToPayload, payloadTypes } from "../../util";

import { useStyles } from './style';

interface PayloadProps {
    payload?: string,
    disabled?: boolean,
    onChange?: (segment: Payload) => void;
}

export function PayloadEditor(props: PayloadProps) {
    const { payload, disabled, onChange } = props;
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
                                customProps={
                                    {
                                        values: payloadTypeArray,
                                        disableCreateNew: true,
                                    }
                                }
                                onChange={onChangeSegmentType}
                            />
                        </Grid>
                        <Grid item={true} xs={7}>
                            <FormTextInput
                                dataTestId="api-extract-segment"
                                defaultValue={segmentState?.name}
                                customProps={{
                                    disabled
                                }}
                                onChange={onChangeSegmentName}
                            />
                        </Grid>
                    </Grid>
                </Grid>
            </div>
        </div>
    );
}
