
import React, { useContext, useEffect, useState } from "react";
import { CloseRounded } from "@material-ui/icons";

import { ButtonWithIcon } from "../../../../../../../../../Diagram/components/Portals/ConfigForm/Elements/Button/ButtonWithIcon";

import { useStyles } from './style';
import { QueryParam } from "../../types";

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
                />
            </div>
        </div>
    );
}
