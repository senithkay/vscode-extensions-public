
import React, { useContext, useEffect, useState } from "react";

import { Checkbox, Grid } from "@material-ui/core";
import { CloseRounded } from "@material-ui/icons";

import { ButtonWithIcon } from "../../../../../../../../../Diagram/components/Portals/ConfigForm/Elements/Button/ButtonWithIcon";
import { PrimaryButton } from "../../../../../../../../../Diagram/components/Portals/ConfigForm/Elements/Button/PrimaryButton";
import { SecondaryButton } from "../../../../../../../../../Diagram/components/Portals/ConfigForm/Elements/Button/SecondaryButton";
import CheckBoxGroup from "../../../../../../../../../Diagram/components/Portals/ConfigForm/Elements/CheckBox";
import { SelectDropdownWithButton } from "../../../../../../../../../Diagram/components/Portals/ConfigForm/Elements/DropDown/SelectDropdownWithButton";
import { FormTextInput } from "../../../../../../../../../Diagram/components/Portals/ConfigForm/Elements/TextField/FormTextInput";
import { PathSegment } from "../../types";

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
                <Grid container={true} spacing={1}>
                    <Grid container={true} item={true} spacing={2}>
                        <Grid item={true} xs={7}>
                            <div className={classes.labelOfInputs}>
                                Name
                            </div>
                        </Grid>
                        <Grid item={true} xs={5}>
                            <div className={classes.labelOfInputs}>
                                Type
                            </div>
                        </Grid>
                    </Grid>
                    <Grid container={true} item={true} spacing={2}>
                        <Grid item={true} xs={7}>
                            <FormTextInput
                                dataTestId="api-path-segment"
                                defaultValue={segmentState?.name}
                                onChange={(text: string) => { onChangeSegment(text, "NAME") }}
                            />
                        </Grid>
                        <Grid item={true} xs={5}>
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
                    <Grid container={true} item={true} spacing={2}>
                        <Grid item={true} xs={7}>
                            <CheckBoxGroup values={["Is Parameter"]} defaultValues={[segmentState.isParam ? "Is Parameter" : ""]} onChange={onParamCheckChange} />
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
                                    disabled={false}
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
