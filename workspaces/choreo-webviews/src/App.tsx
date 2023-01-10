/*
 *  Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
 * 
 *  This software is the property of WSO2 LLC. and its suppliers, if any.
 *  Dissemination of any information or reproduction of any material contained
 *  herein is strictly forbidden, unless permitted by WSO2 in accordance with
 *  the WSO2 Commercial License available at http://wso2.com/licenses.
 *  For specific language governing the permissions and limitations under
 *  this license, please see the license as well as any agreement you’ve
 *  entered into with WSO2 governing the purchase of this software and any
 *  associated services.
 */
import styled from "@emotion/styled";
import { ChoreoWebViewsProps } from ".";
import { ComponentWizard } from "./ComponentWizard/ComponentWizard";
import { ChoreoWebViewContext } from "./context/choreo-web-view-ctx";
import { usePopulateContext } from "./hooks/context-populate";
import { ProjectWizard } from "./ProjectWizard/ProjectWizard";
import { ProjectOverview } from "./ProjectOverview/ProjectOverview";

export const Main = styled.main`
  display: flex;
  flex-direction: row;
  justify-content: center;
  padding: 20px;
  height: 100vh;
`;

// switch between 
function switchViews(props: ChoreoWebViewsProps) {
  switch (props.type) {
    case 'ProjectCreateForm':
      return <ProjectWizard />;
    case 'ComponentCreateForm':
      return <ComponentWizard />;
    case 'ProjectOverview':
      return <ProjectOverview projectId={props.projectId} />;
  }
}

function App(props: ChoreoWebViewsProps) {

  const contextVal = usePopulateContext();

  return (
    <Main>
      <ChoreoWebViewContext.Provider value={contextVal}>
        {switchViews(props)}
      </ChoreoWebViewContext.Provider>
    </Main>
  );
}

export default App;
