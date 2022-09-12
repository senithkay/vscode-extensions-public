/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
import React, { useState } from 'react';

import { IconButton } from "@material-ui/core";
import { createStyles, makeStyles } from "@material-ui/core/styles";

import CollapseIcon from "../../../../assets/icons/CollapseIcon";
import { ViewOption } from "../../../DataMapper/DataMapper";

import { ExpandedMappingHeaderNode } from "./ExpandedMappingHeaderNode";
import CodeOutlinedIcon from '@material-ui/icons/CodeOutlined';
import AddCircleOutline from '@material-ui/icons/AddCircleOutline';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import { NodePosition, STNode } from '@wso2-enterprise/syntax-tree';
import { STModification } from '@wso2-enterprise/ballerina-languageclient';

const useStyles = makeStyles(() =>
    createStyles({
        root: {
            width: '100%',
            minWidth: 200,
            backgroundColor: "#fff",
            padding: "5px",
            display: "flex",
            flexDirection: "column",
            gap: "5px",
            color: "#74828F"
        },
        clause: {
            padding: "5px",
            fontFamily: "monospace",
            flex: 1,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: 200,
        },
        header: {
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
        },
        iconsButton: {
            padding: '8px',
            '&:hover': {
                backgroundColor: '#F0F1FB',
            }
        },
        icon: {
            height: '15px',
            width: '15px',
            marginTop: '-7px',
            marginLeft: '-7px'
        },
        buttonWrapper: {
            border: '1px solid #e6e7ec',
            borderRadius: '8px',
            right: "35px"
        },
        whereClauseWrap: {
            display: 'flex',
            alignItems: 'center'
        },

        // todo: remove after replacing with statement editor
        input: {
            padding: "5px",
            fontFamily: "monospace",
            zIndex: 1000,
            border: "1px solid #5567D5"
        }
    })
);

export interface ExpandedMappingHeaderWidgetProps {
    node: ExpandedMappingHeaderNode;
    title: string;
}

export function ExpandedMappingHeaderWidget(props: ExpandedMappingHeaderWidgetProps) {
    const { node, title } = props;
    const classes = useStyles();

    // todo: remove after replacing with statement editor
    const [editable, setEditable] = useState<boolean>(false);
    const [editKey, setEditKey] = useState('');
    const [str, setStr] = useState("");

    const onClickOnCollapse = () => {
        node.context.changeSelection(ViewOption.COLLAPSE);
    }

    const onClickEdit = (editNode: STNode) => {
        props.node.context.enableStamentEditor(editNode);
    };

    const onChange = (newVal: string) => {
        setStr(newVal);
    };

    // todo: remove after replacing with statement editor
    const onKeyUp = (key: string, node?: STNode) => {
        if (key === "Escape") {
            setEditable(false);
            setEditKey('')
        }
        if (key === "Enter") {
            updateSource(node)
        }
    };

    // todo: remove after replacing with statement editor
    const updateSource = (node?: STNode) => {
        const modifications: STModification[] = [];
        if (editKey === 'new') {
            if (props.node.queryExpr.queryPipeline.intermediateClauses?.length === 0) {
                const position: NodePosition = props.node.queryExpr.queryPipeline.position
                modifications.push({
                    type: "INSERT",
                    config: {
                        "STATEMENT": `\n${str}`,
                    },
                    endColumn: position.endColumn,
                    endLine: position.endLine,
                    startColumn: position.endColumn,
                    startLine: position.startLine
                })
            } else {
                const intermediateCount = props.node.queryExpr.queryPipeline.intermediateClauses.length;
                const position: NodePosition = props.node.queryExpr.queryPipeline.intermediateClauses[intermediateCount - 1].position
                modifications.push({
                    type: "INSERT",
                    config: {
                        "STATEMENT": `\n${str}`,
                    },
                    endColumn: position.endColumn,
                    endLine: position.endLine,
                    startColumn: position.endColumn,
                    startLine: position.startLine
                })
            }
        } else if (node) {
            modifications.push({
                type: "INSERT",
                config: {
                    "STATEMENT": str,
                },
                ...node.position
            })
        }
        props.node.context.applyModifications(modifications);
    };

    const deleteWhereClause = (node: STNode) => {
        props.node.context.applyModifications([{
            type: "DELETE",
            ...node.position
        }]);
    }

    return (
        <div className={classes.root}>
            <div className={classes.header}>
                <div className={classes.clause}>
                    {title}
                </div>
                <div className={classes.buttonWrapper}>
                    <IconButton
                        onClick={onClickOnCollapse}
                        className={classes.iconsButton}
                    >
                        <div className={classes.icon}>
                            <CollapseIcon />
                        </div>
                    </IconButton>
                </div>
            </div>
            {props.node.queryExpr.queryPipeline.intermediateClauses?.map((clauseItem, index) =>
                <div className={classes.whereClauseWrap} key={`${index}-${clauseItem.source}`}>
                    {editKey === `${index}-${clauseItem.source}` && editable ? <input
                        spellCheck={false}
                        className={classes.input}
                        autoFocus={true}
                        value={str}
                        onChange={(event) => onChange(event.target.value)}
                        onKeyUp={(event) => onKeyUp(event.key, clauseItem)}
                        onBlur={() => setEditable(false)}
                    /> : <>
                        <div className={classes.clause}>
                            {clauseItem.source?.trim()}
                        </div>
                        <IconButton
                            onClick={() => {
                                setEditable(true);
                                setStr(clauseItem.source)
                                setEditKey(`${index}-${clauseItem.source}`)
                            }}
                            className={classes.iconsButton}
                        >
                            <div className={classes.icon}>
                                <CodeOutlinedIcon />
                            </div>
                        </IconButton>
                        <IconButton
                            onClick={() => deleteWhereClause(clauseItem)}
                            className={classes.iconsButton}
                        >
                            <div className={classes.icon}>
                                <HighlightOffIcon />
                            </div>
                        </IconButton>
                    </>}

                </div>
            )}

            <div className={classes.whereClauseWrap}>
                {editKey === 'new' && editable ? <input
                    spellCheck={false}
                    className={classes.input}
                    autoFocus={true}
                    value={str}
                    onChange={(event) => onChange(event.target.value)}
                    onKeyUp={(event) => onKeyUp(event.key)}
                    onBlur={() => setEditable(false)}
                /> : <>
                    <div className={classes.clause}>
                        Add Where Clause
                    </div>
                    <IconButton
                        onClick={() => {
                            setEditable(true);
                            setStr("")
                            setEditKey('new')
                        }}
                        className={classes.iconsButton}
                    >
                        <div className={classes.icon}>
                            <AddCircleOutline />
                        </div>
                    </IconButton>
                </>}
            </div>

        </div>
    );
}
