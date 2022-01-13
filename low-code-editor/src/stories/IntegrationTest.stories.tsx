import React from 'react';

import { storiesOf } from '@storybook/react';

import { DiagramGeneratorProps } from '../DiagramGenerator';

import testProject from "./data/testproject.json";
import { DiagramGeneratorWrapper } from './DiagramGeneratorWrapper';
import { getFileContent, langClientPromise, updateFileContent } from './story-utils';

const stories = storiesOf('Low Code Editor/IntegrationTest/project', module);

testProject.balFiles.forEach(balFile => {
  const relativePath = balFile.substring(testProject.projectPath.length);
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
    getPFSession: () => Promise.resolve({} as any),
    getPerfDataFromChoreo: () =>  Promise.resolve({} as any),
    gotoSource: () => Promise.resolve(false),
    lastUpdatedAt: (new Date()).toISOString(),
    resolveMissingDependency: () => Promise.resolve(false),
    resolveMissingDependencyByCodeAction: () => Promise.resolve(false),
    runCommand: () => Promise.resolve(false),
    sendTelemetryEvent: () => Promise.resolve(undefined),
    showMessage: () => Promise.resolve(false),
    showPerformanceGraph: () => Promise.resolve(false),
    updateFileContent: () => Promise.resolve(false),
  }
}
