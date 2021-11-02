
import React, { useState } from "react";

import { Grid } from "@material-ui/core";

import CheckBoxGroup from "../../../../../../../FormComponents/FormFieldComponents/CheckBox";
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
