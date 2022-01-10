import React from 'react';

import { storiesOf } from '@storybook/react';
import { BalleriaLanguageClient, WSConnection } from '@wso2-enterprise/ballerina-languageclient';

import { DiagramGenerator, DiagramGeneratorProps } from '../DiagramGenerator';

import bbesList from "./data/bbes.json";
import { DiagramGeneratorWrapper } from './DiagramGeneratorWrapper';

const MOCK_SERVER_URL = "http://localhost:3000"
const LANG_SERVER_URL = "ws://localhost:9095"

const langClientPromise = WSConnection.initialize(LANG_SERVER_URL).then((wsConnection: WSConnection) => {
  return new BalleriaLanguageClient(wsConnection);
});

const ballerinaHomePath = "/usr/lib/ballerina/distributions/ballerina-slbeta6/examples/";

function getBBEFilePath(bbeID: string) {
  return ballerinaHomePath + bbeID + "/" + bbeID.replaceAll('-', '_') + ".bal";
}

bbesList.forEach(bbe => {
  const stories = storiesOf('Low Code Editor/BBEs/' + bbe.title, module);
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

async function getFileContent(filePath: string): Promise<string> {
  return fetch(MOCK_SERVER_URL + "/file/" + encodeURIComponent(filePath))
    .then(response => {
      return response.text()
    })
}

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
