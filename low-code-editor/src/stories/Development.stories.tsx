import React from 'react';

import { storiesOf } from '@storybook/react';

import { DiagramGeneratorProps } from '../DiagramGenerator';

import devProject from "./data/devproject.json";
import { DiagramGeneratorWrapper } from './DiagramGeneratorWrapper';
import { getFileContent, langClientPromise, updateFileContent } from './story-utils';

const stories = storiesOf('Low Code Editor/Development/project', module);

devProject.balFiles.forEach((balFile: string) => {
  const relativePath = balFile.substring(devProject.projectPath.length);
  stories.add(
    relativePath,
    () => {
      const diagramProps = getDiagramGeneratorProps(balFile);
      return <DiagramGeneratorWrapper {...diagramProps} />
    }
  )
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
    updateFileContent,
    getLibrariesList: () => Promise.resolve(undefined),
    getLibrariesData: () => Promise.resolve(undefined),
    getLibraryData: () => Promise.resolve(undefined),
    getSentryConfig: () => Promise.resolve(undefined),
    experimentalEnabled: true
  }
}
