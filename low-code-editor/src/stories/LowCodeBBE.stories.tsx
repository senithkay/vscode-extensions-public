import React from 'react';

import { storiesOf } from '@storybook/react';

import { DiagramGeneratorProps } from '../DiagramGenerator';

import balDist from "./data/baldist.json";
import bbesList from "./data/bbes.json";
import { DiagramGeneratorWrapper } from './DiagramGeneratorWrapper';
import { getFileContent, langClientPromise } from "./story-utils";

function getBBEFilePath(bbeID: string) {
  return balDist.balHome + "/examples/"  + bbeID + "/" + bbeID.replaceAll('-', '_') + ".bal";
}

export interface BBESample {
  name: string;
  url: string;
}

export interface BBE {
  title: string;
  samples: BBESample[];
}

bbesList.forEach((bbe: BBE)  => {
  const stories = storiesOf('Low Code Editor/Testing/BBEs/' + bbe.title, module);
  bbe.samples.forEach((bbeItem) => {
    stories.add(
      bbeItem.name,
      () => {
        const diagramProps = getDiagramGeneratorProps(getBBEFilePath(bbeItem.url));
        return <DiagramGeneratorWrapper {...diagramProps} />
      }
    )
  });
});


function getDiagramGeneratorProps(filePath: string): DiagramGeneratorProps {
  return {
    langClientPromise,
    scale: "1",
    panX: "0",
    panY: "0",
    filePath,
    startColumn: 0,
    startLine: 0,
    getFileContent,
    getPFSession: () => Promise.resolve(undefined),
    getPerfDataFromChoreo: () =>  Promise.resolve(undefined),
    gotoSource: () => Promise.resolve(false),
    lastUpdatedAt: (new Date()).toISOString(),
    resolveMissingDependency: () => Promise.resolve(false),
    resolveMissingDependencyByCodeAction: () => Promise.resolve(false),
    runCommand: () => Promise.resolve(false),
    sendTelemetryEvent: () => Promise.resolve(undefined),
    showMessage: () => Promise.resolve(false),
    showPerformanceGraph: () => Promise.resolve(false),
    updateFileContent: () => Promise.resolve(false),
    getLibrariesList: () => Promise.resolve(undefined),
    getLibrariesData: () => Promise.resolve(undefined),
    getLibraryData: () => Promise.resolve(undefined),
    getSentryConfig: () => Promise.resolve(undefined)
  }
}
