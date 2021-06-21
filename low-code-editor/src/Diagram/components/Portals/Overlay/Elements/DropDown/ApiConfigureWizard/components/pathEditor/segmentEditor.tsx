
import React, { useContext, useEffect, useState } from "react";
import { CloseRounded } from "@material-ui/icons";
import { Checkbox, Grid } from "@material-ui/core";
import { ButtonWithIcon } from "../../../../../../../../../Diagram/components/Portals/ConfigForm/Elements/Button/ButtonWithIcon";

import { useStyles } from './style';
import { FormTextInput } from "../../../../../../../../../Diagram/components/Portals/ConfigForm/Elements/TextField/FormTextInput";
import { SelectDropdownWithButton } from "../../../../../../../../../Diagram/components/Portals/ConfigForm/Elements/DropDown/SelectDropdownWithButton";
import CheckBoxGroup from "../../../../../../../../../Diagram/components/Portals/ConfigForm/Elements/CheckBox";
import { SecondaryButton } from "../../../../../../../../../Diagram/components/Portals/ConfigForm/Elements/Button/SecondaryButton";
import { PrimaryButton } from "../../../../../../../../../Diagram/components/Portals/ConfigForm/Elements/Button/PrimaryButton";
import { PathSegment } from "../../types";

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
    };

    const onParamCheckChange = (text: string[]) => {
        if (text) {
            setSegmentState({
                ...segmentState,
                isParam: text.length > 1
            });
        }
    };

    const handleOnSave = () => {
        onSave(segmentState);
    };

    return (
        <div className={classes.segmentEditorWrap}>
            <div>
                <Grid container spacing={1}>
                    <Grid container item spacing={2}>
                        <Grid item xs={7}>
                            <div className={classes.labelOfInputs}>
                                name
                            </div>
                        </Grid>
                        <Grid item xs={5}>
                            <div className={classes.labelOfInputs}>
                                type
                            </div>
                        </Grid>
                    </Grid>
                    <Grid container item spacing={2}>
                        <Grid item xs={7}>
                            <FormTextInput
                                dataTestId="api-path-segment"
                                defaultValue={segmentState?.name}
                                onChange={(text: string) => { onChangeSegment(text, "NAME") }}
                            />
                        </Grid>
                        <Grid item xs={5}>
                            <SelectDropdownWithButton
                                defaultValue={segmentState?.type}
                                disabled={!segmentState?.isParam}
                                customProps={
                                    {
                                        values: ["string", "int"],
                                        disableCreateNew: true,
                                    }
                                }
                                onChange={(text: string) => { onChangeSegment(text, "TYPE") }}
                            />
                        </Grid>
                    </Grid>
                    <Grid container item spacing={2}>
                        <Grid item xs={7}>
                            <CheckBoxGroup values={["Is Parameter"]} defaultValues={[segmentState.isParam ? "Is Parameter" : ""]} onChange={onParamCheckChange} />
                        </Grid>
                    </Grid>
                    <Grid container item spacing={2}>
                        <Grid item xs={5}>

                        </Grid>
                        <Grid container item xs={7}>
                            <Grid item xs={6} spacing={1}>
                                <SecondaryButton
                                    text="Cancel"
                                    fullWidth={false}
                                    onClick={onCancel} />
                            </Grid>
                            <Grid item xs={6} spacing={1}>
                                <PrimaryButton
                                    dataTestId={"custom-expression-save-btn"}
                                    text={"Add"}
                                    disabled={false}
                                    fullWidth={false}
                                    onClick={handleOnSave}
                                />
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </div>
        </div>
    );
}
