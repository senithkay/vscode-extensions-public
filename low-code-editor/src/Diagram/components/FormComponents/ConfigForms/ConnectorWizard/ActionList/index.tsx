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
// tslint:disable: jsx-no-multiline-js jsx-wrap-multiline
import React, { useContext, useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";

import { Box, FormControl, Input, InputAdornment, List, ListItem, Typography } from "@material-ui/core";
import { FunctionDefinitionInfo } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { FormHeaderSection } from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";

import SearchIcon from "../../../../../../assets/icons/SearchIcon";
import { Context } from "../../../../../../Contexts/Diagram";
import { TextPreLoader } from "../../../../../../PreLoader/TextPreLoader";
import { FormGeneratorProps } from "../../../FormGenerator";
import { wizardStyles as useFormStyles } from "../../style";
import useStyles from "../style";

interface ActionListProps {
    actions: FunctionDefinitionInfo[];
    onSelect: (action: FunctionDefinitionInfo) => void;
}

export function ActionList(props: FormGeneratorProps) {
    const classes = useStyles();
    const formClasses = useFormStyles();

    const { model, targetPosition, onCancel, onSave, configOverlayFormStatus } = props;
    const { isLoading, formArgs } = configOverlayFormStatus;
    const { actions, onSelect } = formArgs as ActionListProps;

    const {
        props: { currentFile, stSymbolInfo, syntaxTree, experimentalEnabled },
        api: {
            ls: { getExpressionEditorLangClient },
            code: { modifyDiagram },
            library,
        },
    } = useContext(Context);

    const [keyword, setKeyword] = useState("");
    const [filteredActions, setFilteredActions] = useState<FunctionDefinitionInfo[]>([]);

    useEffect(() => {
        const searchKeyword = keyword.toLowerCase().trim();
        if (searchKeyword.length > 1 && searchKeyword !== "") {
            const filter = actions.filter((action) => {
                if (
                    action.name.toLowerCase().indexOf(searchKeyword) > -1 ||
                    action.displayAnnotation?.label?.toLowerCase().toLowerCase().indexOf(searchKeyword) > -1
                ) {
                    return action;
                }
            });
            setFilteredActions(filter);
        } else {
            setFilteredActions(actions);
        }
    }, [actions, keyword]);

    const actionElementList = filteredActions?.map((action) => {
        if (action.name === "init") {
            return;
        }
        const name = action.displayAnnotation?.label || action.name;
        const handleOnSelect = () => {
            onSelect(action);
        };
        return (
            <ListItem
                key={`action-${action.name.toLowerCase()}`}
                data-testid={`${action.name.toLowerCase().replaceAll(" ", "-")}`}
                button={true}
                onClick={handleOnSelect}
            >
                <Typography variant="h4">{name}</Typography>
            </ListItem>
        );
    });

    const handleActionSearch = (e: any) => {
        setKeyword(e.target.value);
    };

    return (
        <FormControl data-testid="endpoint-list-form" className={formClasses.wizardFormControlExtended}>
            <FormHeaderSection
                onCancel={onCancel}
                formTitle={"lowcode.develop.configForms.actionList.title"}
                defaultMessage={"Action"}
            />
            <div className={formClasses.formWrapper}>
                <div className={formClasses.formFeilds}>
                    <div className={classes.container}>
                        {isLoading && (
                            <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
                                <TextPreLoader position="absolute" text="Fetching Actions..." />
                            </Box>
                        )}
                        {!isLoading && (
                            <FormControl style={{ width: "inherit" }}>
                                <Input
                                    className={classes.searchBox}
                                    value={keyword}
                                    autoFocus={true}
                                    placeholder={`Search actions`}
                                    onChange={handleActionSearch}
                                    endAdornment={
                                        <InputAdornment position={"end"} style={{ padding: "8.5px" }}>
                                            <SearchIcon />
                                        </InputAdornment>
                                    }
                                />
                            </FormControl>
                        )}
                        {!isLoading && filteredActions?.length > 0 && (
                            <>
                                <Typography>
                                    <FormattedMessage
                                        id="lowcode.develop.configForms.actionList.subtitle"
                                        defaultMessage="Select an action"
                                    />
                                </Typography>
                                <div className={classes.actionList}>
                                    <List>{actionElementList}</List>
                                </div>
                            </>
                        )}
                        {!isLoading && filteredActions?.length === 0 && (
                            <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
                                <Typography className={classes.emptyTitle}>
                                    <FormattedMessage
                                        id="lowcode.develop.configForms.actionList.empty"
                                        defaultMessage="No actions found"
                                    />
                                </Typography>
                            </Box>
                        )}
                    </div>
                </div>
            </div>
        </FormControl>
    );
}
