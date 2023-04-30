import { Logger } from 'winston';
import { Config } from '@backstage/config';
import {
  PluginCacheManager,
  PluginDatabaseManager,
  PluginEndpointDiscovery,
  TokenManager,
  UrlReader,
} from '@backstage/backend-common';
import { ServerPermissionClient } from '@backstage/plugin-permission-node';
import { PluginTaskScheduler } from '@backstage/backend-tasks';
import { IdentityApi } from '@backstage/plugin-auth-node';

export type PluginEnvironment = {
  logger: Logger;
  cache: PluginCacheManager;
  database: PluginDatabaseManager;
  config: Config;
  reader: UrlReader;
  discovery: PluginEndpointDiscovery;
  tokenManager: TokenManager;
  permissions: ServerPermissionClient;
  scheduler: PluginTaskScheduler;
  identity: IdentityApi;
};
