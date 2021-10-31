
import React, { useContext, useEffect, useState } from "react";

import { CloseRounded } from "@material-ui/icons";

import { ButtonWithIcon } from "../../../../../../FormComponents/FormFieldComponents/Button/ButtonWithIcon";
import { QueryParam } from "../../types";

import { useStyles } from './style';

interface QueryParamItemProps {
    queryParam: QueryParam;
    onDelete?: (queryParam: QueryParam) => void;
    onEdit?: (queryParam: QueryParam) => void;
}

export function QueryParamItem(props: QueryParamItemProps) {
    const { queryParam, onDelete } = props;
    const classes = useStyles();

    const segmentLabel = queryParam.type + " " + queryParam.name;
    const handleDelete = () => {
        onDelete(queryParam);
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
