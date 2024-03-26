/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect } from 'react';
import { WorkspaceFolder } from '@wso2-enterprise/mi-core';
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';
import { Button, Typography } from '@wso2-enterprise/ui-toolkit';
import styled from '@emotion/styled';
import { View, ViewContent, ViewHeader } from '../../components/View';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 36px;
  padding: 85px 120px;
`;

const Block = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Headline = styled.div`
  font-size: 2.7em;
  font-weight: 400;
  font-size: 2.7em;
  white-space: nowrap;
  padding-bottom: 10px;
`;

const SubTitle = styled.div`
  font-weight: 400;
  margin-top: 0;
  margin-bottom: 5px;
  font-size: 1.5em;
  line-height: normal;
`;

const Card = styled.div`
  border: 1px solid var(--vscode-activityBar-dropBorder);
  border-radius: 8px;
  padding: 16px;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
`;

export function OldProjectOverview() {
  const { rpcClient } = useVisualizerContext();
  const [activeWorkspaces, setActiveWorkspaces] = React.useState<WorkspaceFolder>(undefined);

  const handleMigrateProject = async () => {
    rpcClient
      .getMiDiagramRpcClient()
      .migrateProject({ source: activeWorkspaces?.fsPath })
      .then(response => {
        console.log(response);
      });
  };

  useEffect(() => {
    rpcClient
      .getMiVisualizerRpcClient()
      .getWorkspaces()
      .then(response => {
        setActiveWorkspaces(response.workspaces[0]);
        console.log(response.workspaces[0]);
      });
  }, []);

  return (
    <View>
      <ViewHeader title={'Project: ' + activeWorkspaces?.name} codicon='project' />
      <ViewContent padding>
        <Container>
          <Block>
            <Headline>MI VSCode Extension</Headline>
            <Typography variant='body3'>
              Elevate your digital transformation journey with the MI VSCode Extension, your comprehensive integration
              solution. This tool streamlines the connectivity between applications, services, data, and the cloud
              through a user-friendly, low-code graphical interface. For further details, please consult the{' '}
              <a href='https://ei.docs.wso2.com' target='_blank' rel='noopener noreferrer'>
                official documentation
              </a>
              .
            </Typography>
          </Block>
          <Block>
            <SubTitle>Integration Studio Projects</SubTitle>
            <Typography variant='body3'>
              Although Integration Studio is now a legacy platform for integration design and development, it retains
              limited compatibility with the MI VSCode extension. Users can still modify existing artifacts and view
              project diagrams. Creation of new artifacts within the VSCode extension is not supported, requiring the
              use of Integration Studio for these activities.
            </Typography>
            <Card>
              <Block>
                <Typography variant='body1'>Utilizing the Extension with Integration Studio Projects</Typography>
                <Typography variant='body3'>
                  To access the diagram view of your project, simply click the "Open Diagram" button within your synapse
                  file.
                </Typography>
                {/* TODO: Import image */}
              </Block>
            </Card>
            <Typography variant='body3'>
              For an enhanced experience, migrating your project to a fully supported format by the VSCode extension is
              advisable. The migration tool facilitates the conversion of your Integration Studio project into a
              compatible format with the MI VSCode extension, ensuring full access to all features offered by the
              extension without restrictions.
            </Typography>
            <Typography variant='body3'>
              Begin the migration process by selecting the "Migrate Project" option below.
            </Typography>
            <ButtonContainer>
              <Button appearance='primary' onClick={handleMigrateProject}>
                Migrate
              </Button>
            </ButtonContainer>
          </Block>
        </Container>
      </ViewContent>
    </View>
  );
}

