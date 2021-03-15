/*
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
import React, { useContext, useEffect, useState } from "react";

import { FunctionBodyBlock, FunctionDefinition } from "@ballerina/syntax-tree";
import Typography from "@material-ui/core/Typography";

import { DiagramOverlayPosition } from "../../../..";
import { ConnectionDetails } from "../../../../../../../../api/models";
import { Context as DiagramContext } from "../../../../../../../../Contexts/Diagram";
import { GithubConnectionInfo, GithubRepo } from "../../../../../../../../Definitions";
import { CirclePreloader } from "../../../../../../../../PreLoader/CirclePreloader";
import { TRIGGER_TYPE_WEBHOOK } from "../../../../../../../models";
import { DefaultConfig } from "../../../../../../../visitors/default";
import { ConnectionType, OauthConnectButton } from "../../../../../../OauthConnectButton";
import { FormAutocomplete } from "../../../../../ConfigForm/Elements/Autocomplete";
import { PrimaryButton } from "../../../../../ConfigForm/Elements/Button/PrimaryButton";
import { TooltipIcon } from "../../../../../ConfigForm/Elements/Tooltip";
import { tooltipMessages } from "../../../../../utils/constants";
import { SourceUpdateConfirmDialog } from "../../../SourceUpdateConfirmDialog";
import { useStyles } from "../../styles";

export const CONNECTOR_TYPES = {
    GITHUB: "github",
    GOOGLE_SHEETS: "googleSheets",
    GOOGLE_CALENDAR: "googleCalendar"
};

interface GitHubConfigureFormProps {
    position: DiagramOverlayPosition;
    onComplete: () => void;
    currentEvent?: string;
    currentAction?: string;
    currentConnection?: ConnectionDetails;
}

export interface ConnectorEvents {
    [key: string]: any;
}

export function GitHubConfigureForm(props: GitHubConfigureFormProps) {
    const { state } = useContext(DiagramContext);
    const {
        isMutationProgress: isFileSaving,
        isLoadingSuccess: isFileSaved,
        syntaxTree,
        onModify: dispatchModifyTrigger,
        trackTriggerSelection,
        currentApp,
        getGithubRepoList
    } = state;
    const model: FunctionDefinition = syntaxTree as FunctionDefinition;
    const body: FunctionBodyBlock = model?.functionBody as FunctionBodyBlock;
    const isEmptySource = (body?.statements.length < 1) || (body?.statements === undefined);
    const { position, onComplete, currentEvent, currentAction, currentConnection } = props;
    const classes = useStyles();

    const [activeEvent, setActiveEvent] = useState<string>(currentEvent);
    const [activeAction, setActiveAction] = useState<string>(currentAction);
    const [activeConnection, setActiveConnection] = useState<ConnectionDetails>(currentConnection);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [triggerChanged, setTriggerChanged] = useState(false);
    const [isRepoListFetching, setIsRepoListFetching] = useState(false);
    const [githubRepoList, setGithubRepoList] = useState<GithubRepo[]>(undefined)
    const [activeGithubRepo, setActiveGithubRepo] = useState<GithubRepo>(null);

    // HACK: hardcoded event list for testing
    const githubEvents: ConnectorEvents = {
        issue_comment: {
            action: {
                created: [
                    "onIssueCommentCreated",
                    "IssueCommentEvent"
                ],
                edited: [
                    "onIssueCommentEdited",
                    "IssueCommentEvent"
                ],
                deleted: [
                    "onIssueCommentDeleted",
                    "IssueCommentEvent"
                ]
            }
        },
        issues: {
            action: {
                assigned: [
                    "onIssuesAssigned",
                    "IssuesEvent"
                ],
                unassigned: [
                    "onIssuesUnassigned",
                    "IssuesEvent"
                ],
                labeled: [
                    "onIssuesLabeled",
                    "IssuesEvent"
                ],
                unlabeled: [
                    "onIssuesUnlabeled",
                    "IssuesEvent"
                ],
                opened: [
                    "onIssuesOpened",
                    "IssuesEvent"
                ],
                edited: [
                    "onIssuesEdited",
                    "IssuesEvent"
                ],
                milestoned: [
                    "onIssuesMilestoned",
                    "IssuesEvent"
                ],
                demilestoned: [
                    "onIssuesDemilestoned",
                    "IssuesEvent"
                ],
                closed: [
                    "onIssuesClosed",
                    "IssuesEvent"
                ],
                reopened: [
                    "onIssuesReopened",
                    "IssuesEvent"
                ]
            }
        },
        label: {
            action: {
                created: [
                    "onLabelCreated",
                    "LabelEvent"
                ],
                edited: [
                    "onLabelEdited",
                    "LabelEvent"
                ],
                deleted: [
                    "onLabelDeleted",
                    "LabelEvent"
                ]
            }
        },
        milestone: {
            action: {
                created: [
                    "onMilestoneCreated",
                    "MilestoneEvent"
                ],
                closed: [
                    "onMilestoneClosed",
                    "MilestoneEvent"
                ],
                opened: [
                    "onMilestoneOpened",
                    "MilestoneEvent"
                ],
                edited: [
                    "onMilestoneEdited",
                    "MilestoneEvent"
                ],
                deleted: [
                    "onMilestoneDeleted",
                    "MilestoneEvent"
                ]
            }
        },
        pull_request: {
            action: {
                assigned: [
                    "onPullRequestAssigned",
                    "PullRequestEvent"
                ],
                unassigned: [
                    "onPullRequestUnassigned",
                    "PullRequestEvent"
                ],
                review_requested: [
                    "onPullRequestReviewRequested",
                    "PullRequestEvent"
                ],
                review_request_removed: [
                    "onPullRequestReviewRequestRemoved",
                    "PullRequestEvent"
                ],
                labeled: [
                    "onPullRequestLabeled",
                    "PullRequestEvent"
                ],
                unlabeled: [
                    "onPullRequestUnlabeled",
                    "PullRequestEvent"
                ],
                opened: [
                    "onPullRequestOpened",
                    "PullRequestEvent"
                ],
                edited: [
                    "onPullRequestEdited",
                    "PullRequestEvent"
                ],
                closed: [
                    "onPullRequestClosed",
                    "PullRequestEvent"
                ],
                reopened: [
                    "onPullRequestReopened",
                    "PullRequestEvent"
                ]
            }
        },
        pull_request_review: {
            action: {
                submitted: [
                    "onPullRequestReviewSubmitted",
                    "PullRequestReviewEvent"
                ],
                edited: [
                    "onPullRequestReviewEdited",
                    "PullRequestReviewEvent"
                ],
                dismissed: [
                    "onPullRequestReviewDismissed",
                    "PullRequestReviewEvent"
                ]
            }
        },
        pull_request_review_comment: {
            action: {
                created: [
                    "onPullRequestReviewCommentCreated",
                    "PullRequestReviewCommentEvent"
                ],
                edited: [
                    "onPullRequestReviewCommentEdited",
                    "PullRequestReviewCommentEvent"
                ],
                deleted: [
                    "onPullRequestReviewCommentDeleted",
                    "PullRequestReviewCommentEvent"
                ]
            }
        }
    };

    const Trigger = "GitHub";

    useEffect(() => {
        if (!isFileSaving && isFileSaved && triggerChanged) {
            onComplete();
            setTriggerChanged(false);
        }
    }, [isFileSaving, isFileSaved]);
    useEffect(() => {
        if (activeConnection) {
            setIsRepoListFetching(true);
            (async () => {
                const repoList = await getGithubRepoList(currentApp?.org, activeConnection.handle, activeConnection.userAccountIdentifier);
                setGithubRepoList(repoList);
                setIsRepoListFetching(false);
            })();
        }
    }, [activeConnection]);

    // handle oauth connect button callbacks
    function handleOnSelectConnection(type: ConnectionType, connection: ConnectionDetails) {
        if (type !== ConnectionType.NOT_CHANGED && connection) {
            setActiveConnection(connection);
        }
    }
    // handle event drop down callbacks
    function handleEventOnChange(event: object, value: any, reason: string) {
        setActiveEvent(value);
        setActiveAction(undefined);
    };
    // handle action drop down callbacks
    function handleActionOnChange(event: object, value: any, reason: string) {
        setActiveAction(value);
    };
    function handleOnDeselectConnection() {
        setActiveConnection(undefined);
    }
    function handleError() {
        setActiveConnection(undefined);
    }
    const handleDialogOnCancel = () => {
        setShowConfirmDialog(false);
    };
    function handleItemLabel(githubRepo: GithubRepo) {
        return githubRepo.name;
    }
    const handleGithubRepoChange = (event: object, value: any) => {
        setActiveGithubRepo(value);
    };

    const handleUserConfirm = () => {
        if (isEmptySource) {
            handleConfigureOnSave();
        } else {
            // get user confirmation if code there
            setShowConfirmDialog(true);
        }
    };
    // handle trigger configure complete
    const handleConfigureOnSave = () => {
        const accessTokenKey = activeConnection?.codeVariableKeys.find(keys => keys.name === 'accessTokenKey').codeVariableKey;
        const clientSecretKey = activeConnection?.codeVariableKeys.find(keys => keys.name === 'clientSecretKey').codeVariableKey;

        setTriggerChanged(true);
        // dispatch and close the wizard
        dispatchModifyTrigger(TRIGGER_TYPE_WEBHOOK, undefined, {
            TRIGGER_NAME: 'github',
            ACCESS_TOKEN: accessTokenKey,
            SECRET_KEY: clientSecretKey,
            WEBHOOK: '/',
            PORT: 8090,
            GH_REPO_URL: activeGithubRepo.url,
            RESOURCE_NAME: githubEvents[activeEvent].action[activeAction][0],
            RECORD_NAME: githubEvents[activeEvent].action[activeAction][1]
        });
        trackTriggerSelection("Github");
    };

    return (
        <>
            <div className={classes.customWrapper}>
                <p className={classes.subTitle}>GitHub Connection</p>
                <OauthConnectButton
                    connectorName={Trigger}
                    onSelectConnection={handleOnSelectConnection}
                    onDeselectConnection={handleOnDeselectConnection}
                    onFailure={handleError}
                />
            </div>
            { activeConnection && isRepoListFetching && (
                <div className={classes.loader}>
                    <CirclePreloader position="relative" />
                    <Typography variant="subtitle2" className={classes.loaderTitle}>
                        Fetching Repositories&nbsp;...
                                        </Typography>
                </div>

            )}
            { activeConnection && !isRepoListFetching && githubRepoList && (
                <div className={classes.customWrapper}>
                    <p className={classes.subTitle}>GitHub Repository</p>
                    <FormAutocomplete
                        placeholder="Choose GitHub Repository"
                        itemList={githubRepoList}
                        value={activeGithubRepo}
                        getItemLabel={handleItemLabel}
                        onChange={handleGithubRepoChange}
                    />
                </div>
            )}

            { activeGithubRepo && (
                <div className={classes.customWrapper}>
                    <TooltipIcon
                        title={tooltipMessages.gitHubEvent}
                        placement="left"
                        arrow={true}
                    >
                        <p className={classes.subTitle}>SELECT EVENT</p>
                    </TooltipIcon>
                    <FormAutocomplete
                        placeholder="Choose an event"
                        itemList={Object.keys(githubEvents)}
                        value={activeEvent}
                        onChange={handleEventOnChange}
                    />
                </div>
            )}

            { activeGithubRepo && activeEvent && (
                <div className={classes.customWrapper}>
                    <TooltipIcon
                        title={tooltipMessages.gitHubAction}
                        placement="left"
                        arrow={true}
                    >
                        <p className={classes.subTitle}>SELECT ACTION</p>
                    </TooltipIcon>
                    <FormAutocomplete
                        placeholder="Choose an action"
                        itemList={Object.keys(githubEvents[activeEvent]?.action)}
                        value={activeAction}
                        onChange={handleActionOnChange}
                    />
                </div>
            )}

            { activeConnection && activeGithubRepo && activeEvent && activeAction && (
                <div className={classes.customFooterWrapper}>
                    <PrimaryButton
                        text="Save"
                        className={classes.saveBtn}
                        onClick={handleUserConfirm}
                        disabled={isFileSaving}
                    />
                </div>
            )}
            { showConfirmDialog && (
                <SourceUpdateConfirmDialog
                    onConfirm={handleConfigureOnSave}
                    onCancel={handleDialogOnCancel}
                />
            )}
        </>
    );
}
