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
import React, { useState } from "react";
import { FormattedMessage } from "react-intl";

import { NodePosition, STNode } from "@wso2-enterprise/syntax-tree";

import { AddIcon } from "../../../../../../../../assets/icons";
import { QueryParam, QueryParamCollection } from "../../types";
import { convertQueryParamStringToSegments, generateQueryParamFromQueryCollection } from "../../util";

import { QueryParamItem } from "./queryParamItem";
import { QueryParamSegmentEditor } from "./segmentEditor";
import { useStyles } from './style';

interface QueryParamEditorProps {
    queryParams?: string;
    defaultValue?: string;
    onChange?: (text: string) => void;
    model?: STNode;
    targetPosition?: NodePosition;
}

export function QueryParamEditor(props: QueryParamEditorProps) {
    const { queryParams, onChange, model, targetPosition } = props;
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
    queryParamCollectionState.queryParams.forEach((value, index) => {
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

    const queryParamSegmentEditor = (
        <div>
            <QueryParamSegmentEditor
                id={queryParamCollectionState.queryParams.length}
                onCancel={onCancel}
                onSave={onSave}
                model={model}
                targetPosition={targetPosition}
            />
        </div>
    );

    const addQueryParamBtnUI = (
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
    );

    return (
        <div>
            <div id="listOfQueryParams" >
                {queryParamsItems}
            </div>
            {addingQueryParam && queryParamSegmentEditor}
            {!addingQueryParam && addQueryParamBtnUI}
        </div>
    );
}
