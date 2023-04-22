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
import React, { useState } from "react";

import { Grid } from "@material-ui/core";

import CheckBoxGroup from "../../../../../FormFieldComponents/CheckBox";
import { Advanced } from "../../types";

import { useStyles } from "./style";

interface AdvancedProps {
    isCaller?: boolean,
    isRequest?: boolean,
    onChange?: (segment: Advanced) => void;
}

export function AdvancedEditor(props: AdvancedProps) {
    const { isCaller, isRequest, onChange } = props;
    const segment: Advanced = {
        isCaller,
        isRequest
    };
    const classes = useStyles();
    const initValue: Advanced = segment ? { ...segment } : {
        isCaller: true,
        isRequest: false
    };

    const [segmentState, setSegmentState] = useState<Advanced>(initValue);

    const onCallerCheckChange = (text: string[]) => {
        const advancedSegment: Advanced = {
            ...segmentState
        };
        if (text) {
            advancedSegment.isCaller = text.length > 1;
            setSegmentState(advancedSegment);
            if (onChange) {
                onChange(advancedSegment);
            }
        }
    };

    const onRequestCheckChange = (text: string[]) => {
        const advancedSegment: Advanced = {
            ...segmentState
        };
        if (text) {
            advancedSegment.isRequest = text.length > 1;
            setSegmentState(advancedSegment);
            if (onChange) {
                onChange(advancedSegment);
            }
        }
    };

    return (
        <div>
            <Grid container={true} spacing={1}>
                <Grid container={true} item={true} spacing={2}>
                    <Grid item={true} xs={6}>
                        <CheckBoxGroup testId="select-request-btn" values={["Add Request"]} defaultValues={[segmentState.isRequest ? "Add Request" : ""]} onChange={onRequestCheckChange} />
                    </Grid>
                    <Grid item={true} xs={6}>
                        <CheckBoxGroup testId="select-caller-btn" values={["Add Caller"]} defaultValues={[segmentState.isCaller ? "Add Caller" : ""]}  onChange={onCallerCheckChange} />
                    </Grid>
                </Grid>
            </Grid>
        </div>
    );
}
