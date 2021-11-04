import React from 'react';

import { ModulePart, NodePosition, STNode } from '@ballerina/syntax-tree';
import { ComponentStory } from '@storybook/react';

import { WizardType } from '../ConfigurationSpec/types';
import { Connector, STModification, STSymbolInfo } from '../Definitions';
import { ConditionConfig } from '../Diagram/components/Portals/ConfigForm/types';
import { LowcodeEvent, TriggerType } from '../Diagram/models';
import { sizingAndPositioningST } from '../DiagramGenerator/generatorUtil';

import LowCodeEditor, { BlockViewState, LowCodeEditorProps } from './../index';
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
    },
    code: {
        modifyDiagram: (mutations: STModification[], options?: any) => undefined,
        onMutate: (type: string, options: any) => undefined,
        setCodeLocationToHighlight: (position: NodePosition) => undefined,
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
        dispactchConfigOverlayForm: (type: string, targetPosition: NodePosition,
                                     wizardType: WizardType, blockViewState?: BlockViewState, config?: ConditionConfig,
                                     symbolInfo?: STSymbolInfo, model?: STNode) => undefined,
        closeConfigOverlayForm: () => undefined,
        configOverlayFormPrepareStart: () => undefined,
        closeConfigPanel: () => undefined,
    }
  }
};
Diagram.args = lowCodeEditorArgs;
