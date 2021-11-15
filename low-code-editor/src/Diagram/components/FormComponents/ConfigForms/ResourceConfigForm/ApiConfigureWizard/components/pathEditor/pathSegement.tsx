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
import React from "react";

import { CloseRounded } from "@material-ui/icons";

import { ButtonWithIcon } from "../../../../../FormFieldComponents/Button/ButtonWithIcon";
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
