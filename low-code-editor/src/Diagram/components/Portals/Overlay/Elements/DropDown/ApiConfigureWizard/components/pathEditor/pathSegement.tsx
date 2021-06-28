
import React, { useContext, useEffect, useState } from "react";

import { CloseRounded } from "@material-ui/icons";

import { ButtonWithIcon } from "../../../../../../../../../Diagram/components/Portals/ConfigForm/Elements/Button/ButtonWithIcon";
import { PathSegment } from "../../types";

import { useStyles } from './style';

interface PathSegmentProps {
    segment: PathSegment;
    onDelete?: (segment: PathSegment) => void;
    onEdit?: (segment: PathSegment) => void;
}

export function PathSegmentItem(props: PathSegmentProps) {
    const { segment, onDelete,  onEdit} = props;
    const classes = useStyles();

    const segmentLabel = segment.isParam ? "[" + segment.type + " " + segment.name + "]" : segment.name;
    const handleDelete = () => {
        onDelete(segment);
    };

    return (
        <div className={classes.headerWrapper}>
            <div className={classes.headerLabel}>
                {segmentLabel}
                <ButtonWithIcon
                    onClick={handleDelete}
                    icon={<CloseRounded fontSize="small" />}
                    className={classes.iconBtn}
                />
            </div>
        </div>
    );
}
