import styled from "@emotion/styled";
import { ProjectWizard } from "./ProjectWizard/ProjectWizard";

export const Main = styled.main`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  height: 100%;
  & > * {
    margin: 1rem 0;
  }
`;

function App() {
  return (
    <Main>
       <ProjectWizard />
    </Main>
  );
}

export default App;
