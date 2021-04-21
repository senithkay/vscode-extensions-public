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
import { FormattedMessage, useIntl } from "react-intl";

import {
    ModulePart, ModuleVarDecl, QualifiedNameReference, RequiredParam,
    ServiceDeclaration, STKindChecker, STNode
} from "@ballerina/syntax-tree";
import Typography from "@material-ui/core/Typography";

import { DiagramOverlayPosition } from "../../../..";
import { ConnectionDetails } from "../../../../../../../../api/models";
import { TooltipIcon } from "../../../../../../../../components/Tooltip";
import { Context as DiagramContext } from "../../../../../../../../Contexts/Diagram";
import { GithubRepo, STModification } from "../../../../../../../../Definitions";
import { CirclePreloader } from "../../../../../../../../PreLoader/CirclePreloader";
import { TRIGGER_TYPE_WEBHOOK } from "../../../../../../../models";
import { createPropertyStatement, updatePropertyStatement } from "../../../../../../../utils/modification-util";
import { ConnectionType, OauthConnectButton } from "../../../../../../OauthConnectButton";
import { FormAutocomplete } from "../../../../../ConfigForm/Elements/Autocomplete";
import { PrimaryButton } from "../../../../../ConfigForm/Elements/Button/PrimaryButton";
import { getKeyFromConnection } from "../../../../../utils";
import { tooltipMessages } from "../../../../../utils/constants";
import { useStyles } from "../../styles";

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
        getGithubRepoList,
        stSymbolInfo,
        originalSyntaxTree,
        onMutate: dispatchMutations
    } = state;
    const { onComplete, currentEvent, currentAction, currentConnection } = props;
    const classes = useStyles();
    const intl = useIntl();

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
    }
    // handle action drop down callbacks
    function handleActionOnChange(event: object, value: any, reason: string) {
        setActiveAction(value);
    }
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
        if (STKindChecker.isModulePart(syntaxTree)) {
            createGithubTrigger();
        } else {
            updateGithubTrigger();
        }
    };
    // handle github trigger creation
    const createGithubTrigger = () => {
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

    const updateGithubTrigger = () => {
        // get nodes to be updated
        const serviceDeclNode = (originalSyntaxTree as ModulePart).members.find(
            member => STKindChecker.isServiceDeclaration(member)) as ServiceDeclaration;
        const webSubNode: STNode = serviceDeclNode?.metadata?.annotations.find(annotation =>
            (annotation.annotReference as QualifiedNameReference).identifier.value === "SubscriberServiceConfig");
        let resourceFunctionNameNode: STNode;
        let recordNameNode: STNode;

        serviceDeclNode.members.forEach(member => {
            if (STKindChecker.isFunctionDefinition(member)) {
                resourceFunctionNameNode = member.functionName;
                (member.functionSignature.parameters as RequiredParam[]).forEach(param => {
                    if ((param.typeName as QualifiedNameReference).modulePrefix.value === "webhook") {
                        recordNameNode = (param.typeName as QualifiedNameReference).identifier;
                    }
                })
                return;
            }
        });

        const accessTokenNode = stSymbolInfo.configurables.get(getKeyFromConnection(activeConnection, 'accessTokenKey'));

        const clientSecretKey = activeConnection?.codeVariableKeys.find(keys => keys.name === 'clientSecretKey').codeVariableKey;
        const accessTokenKey = activeConnection?.codeVariableKeys.find(keys => keys.name === 'accessTokenKey').codeVariableKey;

        // update nodes
        const webSubUpdateTemplate = `@websub:SubscriberServiceConfig {\n
                                          target: [webhook:HUB, "${activeGithubRepo.url}/events/*.json"],\n
                                          secret: ${clientSecretKey},\n
                                          callback: CHOREO_APP_INVOCATION_URL,\n
                                          httpConfig: {\n
                                              auth: {\n
                                                  token: ${accessTokenKey}\n
                                              }\n
                                          }\n
                                      }\n`

        const modifications: STModification[] = [];
        if (resourceFunctionNameNode && recordNameNode) {
            if (!accessTokenNode) {
                const initialConfigurable = (originalSyntaxTree as ModulePart).members.find(member =>
                    (member as ModuleVarDecl)?.qualifiers.find(qualifier =>
                        STKindChecker.isConfigurableKeyword(qualifier)));

                modifications.push(createPropertyStatement(`\nconfigurable string ${getKeyFromConnection(activeConnection, 'accessTokenKey')} = ?;
                configurable string ${getKeyFromConnection(activeConnection, 'clientSecretKey')} = ?;`,
                    {column: 0, line: initialConfigurable?.position?.startLine - 1 || 1}));
            }
            modifications.push(updatePropertyStatement(webSubUpdateTemplate, webSubNode.position));
            modifications.push(updatePropertyStatement(githubEvents[activeEvent].action[activeAction][0], resourceFunctionNameNode.position));
            modifications.push(updatePropertyStatement(githubEvents[activeEvent].action[activeAction][1], recordNameNode.position));
            dispatchMutations(modifications);
        }
        setTriggerChanged(true);
    }

    const chooseRepoPlaceholder = intl.formatMessage({
        id: "lowcode.develop.GitHubConfigWizard.chooseRepository.placeholder",
        defaultMessage: "Choose GitHub Repository"
    });

    const chooseActionPlaceholder = intl.formatMessage({
        id: "lowcode.develop.GitHubConfigWizard.chooseAction.placeholder",
        defaultMessage: "Choose an action"
    });

    const chooseEventPlaceholder = intl.formatMessage({
        id: "lowcode.develop.GitHubConfigWizard.chooseEvent.placeholder",
        defaultMessage: "Choose an event"
    })

    const saveConfigButton = intl.formatMessage({
        id: "lowcode.develop.GitHubConfigWizard.saveConfigButton.text",
        defaultMessage: "Save"
    });

    const gitHubTriggerTooltipMessages = {
        gitHubEvent: {
        title: intl.formatMessage({
            id: "lowcode.develop.gitHubTriggerTooltipMessages.gitHubEvent.tooltip.title",
            defaultMessage: "Select a GitHub event to setup the trigger"
        })},
        gitHubAction: {
            title: intl.formatMessage({
                id: "lowcode.develop.gitHubTriggerTooltipMessages.gitHubAction.tooltip.title",
                defaultMessage: "Select a GitHub action to setup the trigger"
            }),
    }
    }
    return (
        <>
            <div className={classes.customWrapper}>
                <p className={classes.subTitle}><FormattedMessage id="lowcode.develop.GitHubConfigWizard.GitHubConnection.title" defaultMessage="GitHub Connection"/></p>
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
                    <FormattedMessage id="lowcode.develop.GitHubConfigWizard.fetchingReposMessage.text" defaultMessage="Fetching Repositories ..."/>
                                        </Typography>
                </div>

            )}
            { activeConnection && !isRepoListFetching && githubRepoList && (
                <div className={classes.customWrapper}>
                    <p className={classes.subTitle}><FormattedMessage id="lowcode.develop.GitHubConfigWizard.GitHubrepository.title.text" defaultMessage="GitHub Repository"/></p>
                    <FormAutocomplete
                        placeholder={chooseRepoPlaceholder}
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
                        title={gitHubTriggerTooltipMessages.gitHubEvent.title}
                        placement="left"
                        arrow={true}
                    >
                        <p className={classes.subTitle}><FormattedMessage id="lowcode.develop.GitHubConfigWizard.selectEvent.title.text" defaultMessage="SELECT EVENT"/></p>
                    </TooltipIcon>
                    <FormAutocomplete
                        placeholder={chooseEventPlaceholder}
                        itemList={Object.keys(githubEvents)}
                        value={activeEvent}
                        onChange={handleEventOnChange}
                    />
                </div>
            )}

            { activeGithubRepo && activeEvent && (
                <div className={classes.customWrapper}>
                    <TooltipIcon
                        title={gitHubTriggerTooltipMessages.gitHubAction.title}
                        placement="left"
                        arrow={true}
                    >
                        <p className={classes.subTitle}><FormattedMessage id="lowcode.develop.GitHubConfigWizard.selectAction.title.text" defaultMessage="SELECT ACTION"/></p>
                    </TooltipIcon>
                    <FormAutocomplete
                        placeholder={chooseActionPlaceholder}
                        itemList={Object.keys(githubEvents[activeEvent]?.action)}
                        value={activeAction}
                        onChange={handleActionOnChange}
                    />
                </div>
            )}

            { activeConnection && activeGithubRepo && activeEvent && activeAction && (
                <div className={classes.customFooterWrapper}>
                    <PrimaryButton
                        text={saveConfigButton}
                        className={classes.saveBtn}
                        onClick={handleUserConfirm}
                        disabled={isFileSaving}
                    />
                </div>
            )}
        </>
    );
}
