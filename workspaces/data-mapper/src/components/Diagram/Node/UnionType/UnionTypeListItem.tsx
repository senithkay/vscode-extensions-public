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
import React, { useState } from "react";
import { VscSymbolStructure } from "react-icons/vsc";

import { CircularProgress, ListItem, ListItemText, Typography } from "@material-ui/core";
import { StatementEditorHint } from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";
import { NodePosition, STNode } from "@wso2-enterprise/syntax-tree";

import { IDataMapperContext} from "../../../../utils/DataMapperContext/DataMapperContext";
import { getModification } from "../../utils/modifications";

import { useStyles } from "./style";

export interface UnionTypeListItemProps {
    key: number;
    context: IDataMapperContext;
    type: string;
    hasInvalidTypeCast: boolean;
    innermostExpr: STNode;
    typeCastExpr: STNode;
}

export function UnionTypeListItem(props: UnionTypeListItemProps) {
    const { key, context, type, hasInvalidTypeCast, innermostExpr, typeCastExpr } = props;
    const { applyModifications } = context;
    const [isAddingTypeCast, setIsAddingTypeCast] = useState(false);
    const classes = useStyles();

    const onClickOnListItem = async () => {
        setIsAddingTypeCast(true)
        try {
            let targetPosition: NodePosition;
            const valueExprPosition: NodePosition = innermostExpr.position;
            if (hasInvalidTypeCast) {
                const typeCastExprPosition: NodePosition = typeCastExpr.position;
                targetPosition = {
                    ...typeCastExprPosition,
                    endLine: valueExprPosition.startLine,
                    endColumn: valueExprPosition.startColumn
                };
            } else {
                targetPosition = {
                    ...valueExprPosition,
                    endLine: valueExprPosition.startLine,
                    endColumn: valueExprPosition.startColumn
                };
            }
            const modification = [getModification(`<${type}>`, targetPosition)];
            await applyModifications(modification);
        } finally {
            setIsAddingTypeCast(false);
        }
    };

    return (
        <StatementEditorHint
            content={type}
            contentType={null}
        >
            <ListItem
                button={true}
                key={key}
                onMouseDown={onClickOnListItem}
                className={classes.unionTypeListItem}
                disableRipple={true}
            >
                {isAddingTypeCast ? (
                    <CircularProgress size={16} />
                ) : (
                    <VscSymbolStructure
                        style={{ minWidth: '22px', textAlign: 'left', color: '#000' }}
                    />
                )}
                <ListItemText
                    data-testid="suggestion-value"
                    style={{ flex: 'none', maxWidth: '80%' }}
                    primary={(
                        <Typography className={classes.unionTypeValue}>
                            {type}
                        </Typography>
                    )}
                />
            </ListItem>
        </StatementEditorHint>
    );
}
