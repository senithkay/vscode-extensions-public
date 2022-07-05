import React from 'react';

import { storiesOf } from '@storybook/react';


import devProject from "./data/project.json";
import { getDataMapperWrapperProps } from './utils';
import { DataMapperWrapper } from './Wrapper';

const stories = storiesOf('Low Code Editor/Development/project', module);

devProject.balFiles.forEach((balFile: string) => {
  const relativePath = balFile.substring(devProject.projectPath.length);
  stories.add(
    relativePath,
    () => {
      const diagramProps = getDataMapperWrapperProps(balFile);
      return <DataMapperWrapper {...diagramProps} />
    }
  )
});
