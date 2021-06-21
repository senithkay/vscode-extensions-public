import { CloseRounded } from "@material-ui/icons";
import React, { useContext, useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";

import { AddIcon } from "../../../../../../../../../assets/icons";
import { ButtonWithIcon } from "../../../../../../../../../Diagram/components/Portals/ConfigForm/Elements/Button/ButtonWithIcon";
import { QueryParam, QueryParamCollection } from "../../types";
import { convertQueryParamStringToSegments, generateQueryParamFromQueryCollection, genrateBallerinaQueryParams } from "../../util";
import { QueryParamItem } from "./queryParamItem";
import { QueryParamSegmentEditor } from "./segmentEditor";


import { useStyles } from './style';

interface PathEditorProps {
    queryParams?: string;
    defaultValue?: string;
    onChange?: (text: string) => void;
}

export function QueryParamEditor(props: PathEditorProps) {
    const { queryParams, defaultValue, onChange } = props;
    const queryParamCollection: QueryParamCollection = convertQueryParamStringToSegments(queryParams ? queryParams : "");
    const classes = useStyles();

    const [queryParamCollectionState, setQueryParamCollectionState] = useState<QueryParamCollection>(queryParamCollection);
    const [addingQueryParam, setAddingQueryParam] = useState<boolean>(false);

    const onDelete = (queryParam: QueryParam) => {
        const id = queryParam.id;
        if (id > -1) {
            const queryParamCollectionClone: QueryParamCollection = {
                queryParams: queryParamCollection.queryParams
            };
            queryParamCollectionClone.queryParams.splice(id, 1);
            setQueryParamCollectionState(queryParamCollectionClone);
            if (onChange) {
                onChange(generateQueryParamFromQueryCollection(queryParamCollectionClone));
            }
        }
    };

    const queryParamsItems: React.ReactElement[] = [];
    queryParamCollection.queryParams.forEach((value, index) => {
        queryParamsItems.push(<QueryParamItem queryParam={value} onDelete={onDelete} />);
    });

    const onSave = (queryParam: QueryParam) => {
        queryParamCollectionState.queryParams.push(queryParam);
        setQueryParamCollectionState(queryParamCollectionState);
        setAddingQueryParam(!addingQueryParam);
        if (onChange) {
            onChange(generateQueryParamFromQueryCollection(queryParamCollectionState));
        }
    };

    const onCancel = () => {
        setAddingQueryParam(!addingQueryParam);
    };

    const addQueryParam = () => {
        setAddingQueryParam(!addingQueryParam);
    }

    return (
        <div>
            <div id="listOfQueryParams" >
                {queryParamsItems}
            </div>
            {addingQueryParam &&
                <div>
                    <QueryParamSegmentEditor id={queryParamCollectionState.queryParams.length} onCancel={onCancel} onSave={onSave} />
                </div>
            }
            {!addingQueryParam &&
                <div id="">
                    <button
                        onClick={addQueryParam}
                        className={classes.addQueryParamBtn}
                    >
                        <div className={classes.addQueryParamBtnWrap}>
                            <AddIcon />
                            <p><FormattedMessage id="lowcode.develop.apiConfigWizard.addQueryParam.title" defaultMessage="Add Query Param" /></p>
                        </div>
                    </button>
                </div>
            }
        </div>
    );
}
