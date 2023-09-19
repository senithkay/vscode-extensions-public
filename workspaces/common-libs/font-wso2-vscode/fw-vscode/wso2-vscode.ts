export type Wso2VscodeId =
  | "add-check-round"
  | "alarm-round"
  | "ballerina"
  | "browser-round"
  | "choreo"
  | "click-round"
  | "configurable-icon"
  | "custom"
  | "database-round"
  | "dataMapper"
  | "debug"
  | "delete"
  | "design-view"
  | "disable"
  | "doc"
  | "editIcon"
  | "email"
  | "enable-inverse"
  | "enable"
  | "event-round"
  | "inventory-round"
  | "kite-round"
  | "link-round"
  | "loading"
  | "logo-github"
  | "manual"
  | "new-file"
  | "new-folder"
  | "new-module"
  | "organization"
  | "persist-diagram"
  | "project"
  | "proxy"
  | "run-conf"
  | "schedule"
  | "sign-in"
  | "sign-out"
  | "source-view"
  | "start"
  | "sync-alt-round"
  | "tab"
  | "trash"
  | "user"
  | "webhook-round"
  | "webhook"
  | "while-icon";

export type Wso2VscodeKey =
  | "AddCheckRound"
  | "AlarmRound"
  | "Ballerina"
  | "BrowserRound"
  | "Choreo"
  | "ClickRound"
  | "ConfigurableIcon"
  | "Custom"
  | "DatabaseRound"
  | "DataMapper"
  | "Debug"
  | "Delete"
  | "DesignView"
  | "Disable"
  | "Doc"
  | "EditIcon"
  | "Email"
  | "EnableInverse"
  | "Enable"
  | "EventRound"
  | "InventoryRound"
  | "KiteRound"
  | "LinkRound"
  | "Loading"
  | "LogoGithub"
  | "Manual"
  | "NewFile"
  | "NewFolder"
  | "NewModule"
  | "Organization"
  | "PersistDiagram"
  | "Project"
  | "Proxy"
  | "RunConf"
  | "Schedule"
  | "SignIn"
  | "SignOut"
  | "SourceView"
  | "Start"
  | "SyncAltRound"
  | "Tab"
  | "Trash"
  | "User"
  | "WebhookRound"
  | "Webhook"
  | "WhileIcon";

export enum Wso2Vscode {
  AddCheckRound = "add-check-round",
  AlarmRound = "alarm-round",
  Ballerina = "ballerina",
  BrowserRound = "browser-round",
  Choreo = "choreo",
  ClickRound = "click-round",
  ConfigurableIcon = "configurable-icon",
  Custom = "custom",
  DatabaseRound = "database-round",
  DataMapper = "dataMapper",
  Debug = "debug",
  Delete = "delete",
  DesignView = "design-view",
  Disable = "disable",
  Doc = "doc",
  EditIcon = "editIcon",
  Email = "email",
  EnableInverse = "enable-inverse",
  Enable = "enable",
  EventRound = "event-round",
  InventoryRound = "inventory-round",
  KiteRound = "kite-round",
  LinkRound = "link-round",
  Loading = "loading",
  LogoGithub = "logo-github",
  Manual = "manual",
  NewFile = "new-file",
  NewFolder = "new-folder",
  NewModule = "new-module",
  Organization = "organization",
  PersistDiagram = "persist-diagram",
  Project = "project",
  Proxy = "proxy",
  RunConf = "run-conf",
  Schedule = "schedule",
  SignIn = "sign-in",
  SignOut = "sign-out",
  SourceView = "source-view",
  Start = "start",
  SyncAltRound = "sync-alt-round",
  Tab = "tab",
  Trash = "trash",
  User = "user",
  WebhookRound = "webhook-round",
  Webhook = "webhook",
  WhileIcon = "while-icon",
}

export const WSO2_VSCODE_CODEPOINTS: { [key in Wso2Vscode]: string } = {
  [Wso2Vscode.AddCheckRound]: "61697",
  [Wso2Vscode.AlarmRound]: "61698",
  [Wso2Vscode.Ballerina]: "61699",
  [Wso2Vscode.BrowserRound]: "61700",
  [Wso2Vscode.Choreo]: "61701",
  [Wso2Vscode.ClickRound]: "61702",
  [Wso2Vscode.ConfigurableIcon]: "61703",
  [Wso2Vscode.Custom]: "61704",
  [Wso2Vscode.DatabaseRound]: "61705",
  [Wso2Vscode.DataMapper]: "61706",
  [Wso2Vscode.Debug]: "61707",
  [Wso2Vscode.Delete]: "61708",
  [Wso2Vscode.DesignView]: "61709",
  [Wso2Vscode.Disable]: "61710",
  [Wso2Vscode.Doc]: "61711",
  [Wso2Vscode.EditIcon]: "61712",
  [Wso2Vscode.Email]: "61713",
  [Wso2Vscode.EnableInverse]: "61714",
  [Wso2Vscode.Enable]: "61715",
  [Wso2Vscode.EventRound]: "61716",
  [Wso2Vscode.InventoryRound]: "61717",
  [Wso2Vscode.KiteRound]: "61718",
  [Wso2Vscode.LinkRound]: "61719",
  [Wso2Vscode.Loading]: "61720",
  [Wso2Vscode.LogoGithub]: "61721",
  [Wso2Vscode.Manual]: "61722",
  [Wso2Vscode.NewFile]: "61723",
  [Wso2Vscode.NewFolder]: "61724",
  [Wso2Vscode.NewModule]: "61725",
  [Wso2Vscode.Organization]: "61726",
  [Wso2Vscode.PersistDiagram]: "61727",
  [Wso2Vscode.Project]: "61728",
  [Wso2Vscode.Proxy]: "61729",
  [Wso2Vscode.RunConf]: "61730",
  [Wso2Vscode.Schedule]: "61731",
  [Wso2Vscode.SignIn]: "61732",
  [Wso2Vscode.SignOut]: "61733",
  [Wso2Vscode.SourceView]: "61734",
  [Wso2Vscode.Start]: "61735",
  [Wso2Vscode.SyncAltRound]: "61736",
  [Wso2Vscode.Tab]: "61737",
  [Wso2Vscode.Trash]: "61738",
  [Wso2Vscode.User]: "61739",
  [Wso2Vscode.WebhookRound]: "61740",
  [Wso2Vscode.Webhook]: "61741",
  [Wso2Vscode.WhileIcon]: "61742",
};
