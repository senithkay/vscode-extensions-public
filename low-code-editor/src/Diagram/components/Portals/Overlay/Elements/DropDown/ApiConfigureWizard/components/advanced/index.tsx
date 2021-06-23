
import React, { useContext, useEffect, useState } from "react";

import { Checkbox, Grid } from "@material-ui/core";
import { CloseRounded } from "@material-ui/icons";

import { ButtonWithIcon } from "../../../../../../../../../Diagram/components/Portals/ConfigForm/Elements/Button/ButtonWithIcon";
import CheckBoxGroup from "../../../../../../../../../Diagram/components/Portals/ConfigForm/Elements/CheckBox";
import { SelectDropdownWithButton } from "../../../../../../../../../Diagram/components/Portals/ConfigForm/Elements/DropDown/SelectDropdownWithButton";
import { FormTextInput } from "../../../../../../../../../Diagram/components/Portals/ConfigForm/Elements/TextField/FormTextInput";
import { Advanced } from "../../types";
import { convertPayloadStringToPayload } from "../../util";

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
        isCaller: false,
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
                        <CheckBoxGroup values={["Add Request"]} defaultValues={[segmentState.isRequest ? "Add Request" : ""]} onChange={onRequestCheckChange} />
                    </Grid>
                    <Grid item={true} xs={6}>
                        <CheckBoxGroup values={["Add Caller"]} defaultValues={[segmentState.isCaller ? "Add Caller" : ""]}  onChange={onCallerCheckChange} />
                    </Grid>
                </Grid>
            </Grid>
        </div>
    );
}
