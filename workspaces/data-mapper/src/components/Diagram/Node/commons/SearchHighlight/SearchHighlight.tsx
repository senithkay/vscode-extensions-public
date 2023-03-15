/*
 * Copyright (c) 2023, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
// tslint:disable: jsx-no-multiline-js
import React from "react";

import { createStyles, makeStyles } from "@material-ui/core/styles";

import { useDMSearchStore } from "../../../../../store/store";

interface SearchHighlightRootProps extends SearchHighlightProps{
    searchText: string;
}

interface SearchHighlightProps {
    children: string;
}

const useStyles = makeStyles(() =>
    createStyles({
        highlighted: { background: "#ffe39d" },
    })
);

function SearchHighlight({ children, searchText }: SearchHighlightRootProps) {
    const classes = useStyles();
    const parts = children.split(new RegExp(`(${searchText})`, "gi"));
    return (
        <>
            {parts.map((part, index) => (
                <React.Fragment key={index}>
                    {part.toLowerCase() === searchText.toLowerCase() ? (
                        <span className={classes.highlighted}>{part}</span>
                    ) : (
                        part
                    )}
                </React.Fragment>
            ))}
        </>
    );
}

export function InputSearchHighlight({ children }: SearchHighlightProps) {
    const inputSearch = useDMSearchStore((state) => state.inputSearch);
    return <SearchHighlight searchText={inputSearch}>{children}</SearchHighlight>
}

export function OutputSearchHighlight({ children }: SearchHighlightProps) {
    const outputSearch = useDMSearchStore((state) => state.outputSearch);
    return <SearchHighlight searchText={outputSearch}>{children}</SearchHighlight>
}
