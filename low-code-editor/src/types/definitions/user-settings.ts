import { ConnectionDetails } from "../../api/models";

export interface Configuration {
  id?: string,
  key: string,
  value?: string,
  scope: string,
  tableData?: any,
  encrypted?: boolean,
  encryptedValue?: string,
}

export interface PostmanCacheConfig{
  cacheCollections: number,
  cacheWorkspaces: number,
}

export interface UserConfigurations {
  configurations: Configuration[],
  connections: ConnectionDetails[],
  secrets: Configuration[],
  isUserConnectionLoading: boolean,
  isUserConfigurationCreating: boolean,
  isUserConfigurationLoading: boolean,
  isUserConfigurationDeleting: boolean,
  isUserConfigurationUpdating: boolean,
  userPublicKey?: string,
  err?: Error,
  postmanCacheConfiguration?: PostmanCacheConfig,
  isPostmanCacheConfigLoading?: boolean,
  isPostmanCacheConfigSaving?: boolean,
}
