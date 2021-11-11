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
// tslint:disable: jsx-no-multiline-js
import React, { ReactNode, SyntheticEvent, useContext, useState } from "react";

import { LocalVarDecl } from "@ballerina/syntax-tree";
import { Box, CircularProgress, Grid, Typography } from "@material-ui/core";

import Tooltip from "../../../components/TooltipV2";
import { Context } from "../../../Contexts/Diagram";
import { Package } from "../../../Definitions";
import { Trigger } from "../../../Definitions/lang-client-extended";
import {
    EVENT_TYPE_AZURE_APP_INSIGHTS,
    LowcodeEvent,
    TRIGGER_SELECTED_INSIGHTS,
} from "../../models";
import FilterByMenu from "../ConnectorList/FilterByMenu";
import SearchBar from "../ConnectorList/SearchBar";
import { getConnectorIconSVG } from "../Portals/utils";

import useStyles from './style';

export interface FilterStateMap {
    [ key: string ]: boolean;
}

export function TriggerList() {
    const classes = useStyles();
    const {
        props: { langServerURL, stSymbolInfo, currentFile },
        api: {
            helpPanel: {
                openConnectorHelp,
            },
            insights: {
                onEvent
            },
            ls: {
                getDiagramEditorLangClient, // This will be used to fetch the triggers from the Balleirna Central
            }
        }
    } = useContext(Context);

    const showTriggerForm = (
        trigger: Trigger,
        varNode: LocalVarDecl
    ) => {
        // TODO: Show trigger form
    };

    const [ centralTriggers, setCentralTriggers ] = useState<Trigger[]>([]);
    const [ localTriggers, setLocalTriggers ] = useState<Trigger[]>([]);
    const [ isSearchResultsFetching, setIsSearchResultsFetching ] = useState(true);
    const [ searchQuery, setSearchQuery ] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [ filterState, setFilterState ] = useState<FilterStateMap>({});

    React.useEffect(() => {
        fetchTriggersList();
    }, [searchQuery, selectedCategory]);

    let centralTriggerComponents: ReactNode[] = [];
    let localTriggerComponents: ReactNode[] = [];

    const onSelectTrigger = (trigger: Trigger) => {
        const event: LowcodeEvent = {
            type: EVENT_TYPE_AZURE_APP_INSIGHTS,
            name: TRIGGER_SELECTED_INSIGHTS,
            property: trigger.displayName || trigger.package.name
        };
        onEvent(event);
        showTriggerForm(trigger, undefined);
        openConnectorHelp(trigger);
    };

    const getTriggerComponents = (triggers: Trigger[]): ReactNode[] => {
        const componentList: ReactNode[] = [];
        triggers?.forEach((trigger: Trigger) => {
            const triggerName = (trigger.displayAnnotation?.label || `${trigger.package?.name} / ${trigger.name}`).replace(/["']/g, "");
            const component: ReactNode = (
                <Grid item={true} sm={6} alignItems="center">
                    <div key={triggerName} onClick={onSelectTrigger.bind(this, trigger)} data-testid={triggerName.toLowerCase()}>
                        <div className={classes.trigger}>
                            <div>{getConnectorIconSVG(trigger)}</div>
                            <div className={classes.triggerName}>{triggerName}</div>
                            <div className={classes.orgName}>by {trigger.package.organization}</div>
                        </div>
                    </div>
                </Grid>
            );
            componentList.push(component);
        });
        return componentList;
    };

    const slackPackage: Package = {
        organization: 'ballerinax',
        name: 'trigger.slack',
        version: '0.2.0'
    };

    const fetchTriggersList = () => {
        const slackTrigger: Trigger = {
            name: "slack",
            package: slackPackage,
            displayName: "Slack Trigger",
            moduleName: "slack.trigger"
        }
        let triggersList: Trigger[];
        triggersList = [slackTrigger];
        setIsSearchResultsFetching(true);
        setCentralTriggers(triggersList);
        setIsSearchResultsFetching(false);
    };

    const preventDiagramScrolling = (e: SyntheticEvent) => {
        e.stopPropagation();
    };

    const onSearchButtonClick = (query: string) => {
        setSearchQuery(query);
    };

    const updateCategory = (category: string) => {
        setSelectedCategory(category);
    };

    if (!isSearchResultsFetching) {
        centralTriggerComponents = getTriggerComponents(centralTriggers);
        localTriggerComponents = getTriggerComponents(localTriggers);
    }

    return (
        <div onWheel={preventDiagramScrolling} className={classes.container} >
            <SearchBar
                searchQuery={searchQuery}
                onSearchButtonClick={onSearchButtonClick}
            />
            <Grid item={true} sm={12} container={true}>
                <Grid item={true} sm={5}>
                    <FilterByMenu
                        filterState={filterState}
                        setFilterState={setFilterState}
                        filterValues={[]}
                        setCategory={updateCategory}
                        selectedCategory={selectedCategory}
                    />
                </Grid>
                <Grid
                    sm={7}
                    container={true}
                    item={true}
                    alignItems="flex-start"
                >
                    { isSearchResultsFetching && (
                        <Grid
                            sm={12}
                            item={true}
                            container={true}
                            alignItems="center"
                            className={classes.msgContainer}
                        >
                            <Grid item={true} sm={12}>
                                <Box display="flex" justifyContent="center">
                                    <CircularProgress data-testid="marketplace-search-loader" />
                                </Box>
                                <Box display="flex" justifyContent="center">
                                    <Typography variant="body1">
                                        Loading...
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    ) }

                    <Grid
                        item={true}
                        sm={12}
                        container={true}
                        direction="row"
                        justifyContent="flex-start"
                        spacing={2}
                        className={classes.triggerWrap}
                    >
                        { centralTriggers?.length > 0 && (
                            <>
                                <Grid item={true} sm={12} className={classes.triggerListWrap}>
                                    <Grid item={true} sm={6} md={6} lg={6}>
                                        <Typography variant="h4">
                                            Public Connectors
                                        </Typography>
                                    </Grid>
                                </Grid>
                                {centralTriggerComponents}
                            </>
                        ) }
                        { localTriggers?.length > 0 && (
                            <>
                                <Grid item={true} sm={12} className={classes.triggerListWrap}>
                                    <Grid item={true} sm={6} md={6} lg={6}>
                                        <Typography variant="h4">
                                            Local Connectors
                                        </Typography>
                                    </Grid>
                                </Grid>
                                {localTriggerComponents}
                            </>
                        ) }
                    </Grid>

                    { !isSearchResultsFetching && centralTriggerComponents.length === 0 && localTriggers.length === 0 && (
                        <Grid
                            sm={12}
                            item={true}
                            container={true}
                            alignItems="center"
                            className={classes.msgContainer}
                        >
                            <Grid item={true} sm={12}>
                                <Box display="flex" justifyContent="center">
                                    <Typography variant="body1">
                                        No connectors found.
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    ) }
                </Grid>
            </Grid>
        </div >
    );
}
