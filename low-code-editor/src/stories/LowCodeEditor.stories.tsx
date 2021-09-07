import React from 'react';

import { ModulePart, STNode } from '@ballerina/syntax-tree';
import { ComponentMeta, ComponentStory } from '@storybook/react';

import { AiSuggestionsReq, ModelCodePosition, OauthProviderConfig } from '../api/models';
import { WizardType } from '../ConfigurationSpec/types';
import { Connector, STModification, STSymbolInfo } from '../Definitions';
import { ConditionConfig } from '../Diagram/components/Portals/ConfigForm/types';
import { LowcodeEvent, TriggerType } from '../Diagram/models';
import { sizingAndPositioningST } from '../DiagramGenerator/generatorUtil';

import LowCodeEditor, { BlockViewState, DiagramEditorLangClientInterface, DraftInsertPosition, LowCodeEditorProps } from './../index';
import syntaxTree from "./data/st-raw.json"

export default {
  title: 'LowCodeEditor/Diagram',
  component: LowCodeEditor,
};

const Template: ComponentStory<typeof LowCodeEditor> = (args) => <LowCodeEditor {...args} />;

export const Diagram = Template.bind({});

// FIXME: Doing this to make main branch build pass so others can continue merging changes
// on top of typed context
const missingProps: any = {};

const lowCodeEditorArgs: LowCodeEditorProps = {
  ...missingProps,
  syntaxTree: sizingAndPositioningST(syntaxTree),
  api: {
    tour: {
        goToNextTourStep: (step: string) => undefined,
    },
    helpPanel: {
        openConnectorHelp: (connector?: Partial<Connector>, method?: string) => undefined,
    },
    notifications: {
        triggerErrorNotification: (msg: Error | string) => undefined,
        triggerSuccessNotification: (msg: Error | string) => undefined,
    },
    ls: {
        getDiagramEditorLangClient: (url: string) => {
          return {} as any;
        },
        getExpressionEditorLangClient: (url: string) => {
          return {} as any;
        }
    },
    insights: {
        onEvent: (event: LowcodeEvent) => undefined,
        trackTriggerSelection: (trigger: string) => undefined,
    },
    code: {
        modifyDiagram: (mutations: STModification[], options?: any) => undefined,
        onMutate: (type: string, options: any) => undefined,
        modifyTrigger: (
            triggerType: TriggerType,
            model?: any,
            configObject?: any
        ) => undefined,
        dispatchCodeChangeCommit: () => Promise.resolve(),
        dispatchFileChange: (content: string, callback?: () => undefined) => Promise.resolve(),
        hasConfigurables: (templateST: ModulePart) => false,
        setCodeLocationToHighlight: (position: ModelCodePosition) => undefined,
    },
    connections: {
        createManualConnection: (orgHandle: string, displayName: string, connectorName: string,
                                 userAccountIdentifier: string,
                                 tokens: { name: string; value: string }[],
                                 selectedType: string) => {
                                      return {} as any;
                                  },
        updateManualConnection: (activeConnectionId: string, orgHandle: string, displayName: string, connectorName: string,
                                 userAccountIdentifier: string, tokens: { name: string; value: string }[],
                                 type?: string, activeConnectionHandler?: string) => {
                                    return {} as any;
                                },
        getAllConnections: (
                        orgHandle: string,
                        connector?: string
                        ) => {
                          return {} as any;
                      },
    },
    ai: {
        getAiSuggestions: (params: AiSuggestionsReq) => {
          return {} as any;
        }
    },
    splitPanel: {
        maximize: (view: string, orientation: string, appId: number | string) => undefined,
        minimize: (view: string, orientation: string, appId: number | string) => undefined,
        setPrimaryRatio: (view: string, orientation: string, appId: number | string) => undefined,
        setSecondaryRatio: (view: string, orientation: string, appId: number | string) => undefined,
        handleRightPanelContent: (viewName: string) => undefined
    },
    data: {
        getGsheetList: (orgHandle: string, handler: string) => {
          return {} as any;
        },
        getGcalendarList: (orgHandle: string, handler: string) => {
          return {} as any;
        },
        getGithubRepoList: (orgHandle: string, handler: string, username: string) => {
          return {} as any;
        },
    },
    oauth: {
        oauthSessions: {},
        dispatchGetAllConfiguration: (orgHandle?: string) => {
          return {} as any;
        },
        dispatchFetchConnectionList: (connector: string, sessionId: string) => undefined,
        dispatchInitOauthSession: (sessionId: string, connector: string, oauthProviderConfig?: OauthProviderConfig) => undefined,
        dispatchResetOauthSession: (sessionId: string) => undefined,
        dispatchTimeoutOauthRequest: (sessionId: string) => undefined,
        dispatchDeleteOauthSession: (sessionId: string) => undefined,
        oauthProviderConfigs: {} as any,
    },
    // FIXME Doesn't make sense to take these methods below from outside
    // Move these inside and get an external API for pref persistance
    // against a unique ID (eg AppID) for rerender from prev state
    panNZoom: {
        pan: (panX: number, panY: number) => undefined,
        fitToScreen: () => undefined,
        zoomIn: () => undefined,
        zoomOut: () => undefined,
    },
    configPanel: {
        dispactchConfigOverlayForm: (type: string, targetPosition: DraftInsertPosition,
                                     wizardType: WizardType, blockViewState?: BlockViewState, config?: ConditionConfig,
                                     symbolInfo?: STSymbolInfo, model?: STNode) => undefined,
        closeConfigOverlayForm: () => undefined,
        configOverlayFormPrepareStart: () => undefined,
        closeConfigPanel: () => undefined,
    }
  }
};
Diagram.args = lowCodeEditorArgs;
