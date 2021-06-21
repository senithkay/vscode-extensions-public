
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
import { QueryParam } from "../../types";

interface PathSegmentEditorProps {
    id?: number;
    segment?: QueryParam,
    onSave?: (segment: QueryParam) => void;
    onCancel?: () => void;
}

export function QueryParamSegmentEditor(props: PathSegmentEditorProps) {
    const { segment, onSave, id, onCancel } = props;
    const classes = useStyles();
    const initValue: QueryParam = segment ? { ...segment } : {
        id: id ? id : 0,
        name: "",
        type: "string"
    };

    const [segmentState, setSegmentState] = useState<QueryParam>(initValue);

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

    const handleOnSave = () => {
        onSave(segmentState);
    };

    return (
        <div className={classes.queryParamEditorWrap}>
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
                                dataTestId="api-query-param-name"
                                defaultValue={segmentState?.name}
                                onChange={(text: string) => { onChangeSegment(text, "NAME") }}
                            />
                        </Grid>
                        <Grid item xs={5}>
                            <SelectDropdownWithButton
                                dataTestId="api-query-param-type"
                                defaultValue={segmentState?.type}
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
