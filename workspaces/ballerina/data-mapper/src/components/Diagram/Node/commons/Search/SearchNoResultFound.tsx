/*
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */
// tslint:disable: jsx-no-multiline-js
import React from "react";

import { createStyles, makeStyles } from "@material-ui/core/styles";

import { useDMSearchStore } from "../../../../../store/store";
import {TreeContainer} from "../Tree/Tree";

interface SearchNoResultFoundRootProps extends SearchNoResultFoundProps {
    searchText: string;
}

interface SearchNoResultFoundProps {
    kind: SearchNoResultFoundKind;
}

export enum SearchNoResultFoundKind {
    InputField = "input field",
    OutputField = "output field",
    OutputValue = "output value",
    LocalVariable = "local variable",
    ModuleVariable = "module variable"
}

const useStyles = makeStyles(() =>
    createStyles({
        noResultFoundBanner: {
            width: "320px"
        }
    })
);

function SearchNoResultFound({ kind, searchText }: SearchNoResultFoundRootProps) {
    const classes = useStyles();
    return (
        <TreeContainer>
            <span className={classes.noResultFoundBanner}>
                {`No matching ${kind} found with ${kind !== SearchNoResultFoundKind.OutputValue ? 'name' : ''} '${searchText}'`}
            </span>
        </TreeContainer>
    );
}

export function InputSearchNoResultFound({ kind }: SearchNoResultFoundProps) {
    const inputSearch = useDMSearchStore((state) => state.inputSearch);
    return <SearchNoResultFound searchText={inputSearch} kind={kind}/>
}

export function OutputSearchNoResultFound({ kind }: SearchNoResultFoundProps) {
    const outputSearch = useDMSearchStore((state) => state.outputSearch);
    return <SearchNoResultFound searchText={outputSearch} kind={kind}/>
}
