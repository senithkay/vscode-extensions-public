
import React, { useContext, useEffect, useState } from "react";
import { CloseRounded } from "@material-ui/icons";
import { Checkbox, Grid } from "@material-ui/core";
import { ButtonWithIcon } from "../../../../../../../../../Diagram/components/Portals/ConfigForm/Elements/Button/ButtonWithIcon";

import { useStyles } from './style';
import { FormTextInput } from "../../../../../../../../../Diagram/components/Portals/ConfigForm/Elements/TextField/FormTextInput";
import { SelectDropdownWithButton } from "../../../../../../../../../Diagram/components/Portals/ConfigForm/Elements/DropDown/SelectDropdownWithButton";

import { Payload } from "../../types";
import { convertPayloadStringToPayload } from "../../util";

interface PayloadProps {
    payload?: string,
    disabled?: boolean,
    onChange?: (segment: Payload) => void;
}

export function PayloadEditor(props: PayloadProps) {
    const { payload, disabled, onChange } = props;
    const segment: Payload = convertPayloadStringToPayload(payload);
    const classes = useStyles();
    const initValue: Payload = segment ? { ...segment } : {
        name: "",
        type: "string"
    };

    const [segmentState, setSegmentState] = useState<Payload>(initValue);

    const onChangeSegment = (text: string, type: string) => {
        if (type === "NAME") {
            setSegmentState({
                ...segmentState,
                name: text
            });
        } else if (type === "TYPE") {
            setSegmentState({
                ...segmentState,
                type: text
            });
        }

        if (onChange) {
            onChange(segmentState);
        }
    };

    return (
        <div className={classes.segmentEditorWrap}>
            <div>
                <Grid container spacing={1}>
                    <Grid container item spacing={2}>
                        <Grid item xs={5}>
                            <div className={classes.labelOfInputs}>
                                type
                            </div>
                        </Grid>
                        <Grid item xs={7}>
                            <div className={classes.labelOfInputs}>
                                name
                            </div>
                        </Grid>
                    </Grid>
                    <Grid container item spacing={2}>
                        <Grid item xs={5}>
                            <SelectDropdownWithButton
                                disabled={disabled}
                                defaultValue={segmentState?.type}
                                customProps={
                                    {
                                        values: ["string", "int", "json", "xml"],
                                        disableCreateNew: true,
                                    }
                                }
                                onChange={(text: string) => { onChangeSegment(text, "TYPE") }}
                            />
                        </Grid>
                        <Grid item xs={7}>
                            <FormTextInput
                                dataTestId="api-extract-segment"
                                defaultValue={segmentState?.name}
                                customProps={{
                                    disabled
                                }}
                                onChange={(text: string) => { onChangeSegment(text, "NAME") }}
                            />
                        </Grid>
                    </Grid>
                </Grid>
            </div>
        </div>
    );
}
