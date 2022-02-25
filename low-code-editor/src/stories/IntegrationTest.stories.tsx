import React from 'react';

import { storiesOf } from '@storybook/react';
import { PerformanceAnalyzerGraphResponse, PerformanceAnalyzerRealtimeResponse } from '@wso2-enterprise/ballerina-low-code-edtior-commons';

import { DiagramGeneratorProps } from '../DiagramGenerator';
import { ANALYZE_TYPE } from '../DiagramGenerator/performanceUtil';

import testProject from "./data/testproject.json";
import { DiagramGeneratorWrapper } from './DiagramGeneratorWrapper';
import { getFileContent, langClientPromise, updateFileContent } from './story-utils';

const stories = storiesOf('Low Code Editor/IntegrationTest/project', module);

testProject.balFiles.forEach((balFile: string) => {
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
    getPFSession: () => Promise.resolve(undefined),
    getPerfDataFromChoreo: generatePerfData,
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

function generatePerfData(data: any, analyzeType: ANALYZE_TYPE): Promise<PerformanceAnalyzerRealtimeResponse | PerformanceAnalyzerGraphResponse> {
  if (analyzeType === ANALYZE_TYPE.REALTIME) {
    if (data.resourcePos.start.line === 20) {
      return Promise.resolve({
        concurrency: { max: 50, min: 1 }, latency: { max: 3738, min: 46 }, tps: { max: 21.66, min: 8.28 }, message: undefined, type: undefined });
    }
    return Promise.resolve({
      concurrency: { max: 1, min: 1 }, latency: { max: 3738, min: 46 }, tps: { max: 21.66, min: 8.28 }, message: undefined, type: undefined });

  } else {
    return Promise.resolve({
      graphData: [
        { concurrency: "1", latency: "137", tps: "7.28" },
        { concurrency: "25", latency: "2399", tps: "10.42" },
        { concurrency: "50", latency: "4366", tps: "11.45" },
        { concurrency: "75", latency: "6638", tps: "11.3" },
        { concurrency: "100", latency: "9213", tps: "10.85" }
      ],
      sequenceDiagramData: [
        { concurrency: "1", values: [{ latency: 46, name: "sample.bal/(22:33,22:67)", tps: 7.28 }, { latency: 45, name: "sample.bal/(24:34,24:68)", tps: 7.28 }, { latency: 47, name: "sample.bal/(25:34,25:68)", tps: 7.28 }] },
        { concurrency: "25", values: [{ latency: 800, name: "sample.bal/(22:33,22:67)", tps: 10.42 }, { latency: 800, name: "sample.bal/(24:34,24:68)", tps: 10.42 }, { latency: 800, name: "sample.bal/(25:34,25:68)", tps: 10.42 }] },
        { concurrency: "50", values: [{ latency: 1455, name: "sample.bal/(22:33,22:67)", tps: 11.45 }, { latency: 1455, name: "sample.bal/(24:34,24:68)", tps: 11.45 }, { latency: 1455, name: "sample.bal/(25:34,25:68)", tps: 11.45 }] },
        { concurrency: "75", values: [{ latency: 2213, name: "sample.bal/(22:33,22:67)", tps: 11.3 }, { latency: 2213, name: "sample.bal/(24:34,24:68)", tps: 11.3 }, { latency: 2213, name: "sample.bal/(25:34,25:68)", tps: 11.3 }] },
        { concurrency: "100", values: [{ latency: 3071, name: "sample.bal/(22:33,22:67)", tps: 10.85 }, { latency: 3071, name: "sample.bal/(24:34,24:68)", tps: 10.85 }, { latency: 3071, name: "sample.bal/(25:34,25:68)", tps: 10.85 }] }
      ],
      message: undefined,
      type: undefined
    });
  }
}
