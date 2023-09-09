export type Wso2VscodeId =
  | "architectureView"
  | "cellView"
  | "choreo"
  | "loading"
  | "organization"
  | "project"
  | "refresh"
  | "sign-in"
  | "sign-out";

export type Wso2VscodeKey =
  | "ArchitectureView"
  | "CellView"
  | "Choreo"
  | "Loading"
  | "Organization"
  | "Project"
  | "Refresh"
  | "SignIn"
  | "SignOut";

export enum Wso2Vscode {
  ArchitectureView = "architectureView",
  CellView = "cellView",
  Choreo = "choreo",
  Loading = "loading",
  Organization = "organization",
  Project = "project",
  Refresh = "refresh",
  SignIn = "sign-in",
  SignOut = "sign-out",
}

export const WSO2_VSCODE_CODEPOINTS: { [key in Wso2Vscode]: string } = {
  [Wso2Vscode.ArchitectureView]: "61697",
  [Wso2Vscode.CellView]: "61698",
  [Wso2Vscode.Choreo]: "61699",
  [Wso2Vscode.Loading]: "61700",
  [Wso2Vscode.Organization]: "61701",
  [Wso2Vscode.Project]: "61702",
  [Wso2Vscode.Refresh]: "61703",
  [Wso2Vscode.SignIn]: "61704",
  [Wso2Vscode.SignOut]: "61705",
};
