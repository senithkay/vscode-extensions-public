/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React from 'react';

import { css } from '@emotion/css';
import { Codicon, LinkButton } from '@wso2-enterprise/ui-toolkit';

const useStyles = () => ({
    exprBarContainer: css({
        display: "flex",
        width: "100%",
        height: "100%",
        backgroundColor: "var(--vscode-sideBarTitle-background)",
        alignItems: "center",
        padding: '5px'
    }),
    addFilterButton: css({
        lineHeight: 2
    }),
});

export interface FilterBarProps {
    applyModifications: () => Promise<void>
}

export default function FilterBar(props: FilterBarProps) {
    const classes = useStyles();


    return (
        <div className={classes.exprBarContainer}>
            <LinkButton
                sx={{ fontSize: "11px", gap: "0px", padding: "5px" }}
                onClick={undefined}
                className={classes.addFilterButton}
            >
                <Codicon name="add" iconSx={{ fontSize: "11px" }} />
                <>Add Filter</>
            </LinkButton>
        </div>
    );
}
