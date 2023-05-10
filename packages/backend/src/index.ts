/*
 * Hi!
 *
 * Note that this is an EXAMPLE Backstage backend. Please check the README.
 *
 * Happy hacking!
 */

import {
  CacheManager,
  DatabaseManager,
  ServerTokenManager,
  SingleHostDiscovery,
  UrlReaders,
  createServiceBuilder,
  getRootLogger,
  loadBackendConfig,
  notFoundHandler,
  useHotMemoize,
} from '@backstage/backend-common';

import { Config } from '@backstage/config';
import { PluginEnvironment } from './types';
import Router from 'express-promise-router';
import { ServerPermissionClient } from '@backstage/plugin-permission-node';
import { DefaultIdentityClient } from '@backstage/plugin-auth-node';
import { TaskScheduler } from '@backstage/backend-tasks';
import app from './plugins/app';
import auth from './plugins/auth';
import badges from './plugins/badges';
import catalog from './plugins/catalog';
import explore from './plugins/explore';
import proxy from './plugins/proxy';
import search from './plugins/search';
import techdocs from './plugins/techdocs';
import todo from './plugins/todo';
import todoList from './plugins/todolist';
import permission from './plugins/permission';
import secretManager from './plugins/secretManager';
import announcements from './plugins/announcements';

function makeCreateEnv(config: Config) {
  const root = getRootLogger();
  const reader = UrlReaders.default({ logger: root, config });
  root.info(`Created UrlReader ${reader}`);
  const discovery = SingleHostDiscovery.fromConfig(config);
  const tokenManager = ServerTokenManager.fromConfig(config, { logger: root });
  const databaseManager = DatabaseManager.fromConfig(config);
  const permissions = ServerPermissionClient.fromConfig(config, {
    discovery,
    tokenManager,
  });
  const identity = DefaultIdentityClient.create({
    discovery,
  });
  const cacheManager = CacheManager.fromConfig(config);
  const taskScheduler = TaskScheduler.fromConfig(config);

  return (plugin: string): PluginEnvironment => {
    const logger = root.child({ type: 'plugin', plugin });
    const scheduler = taskScheduler.forPlugin(plugin);
    const database = databaseManager.forPlugin(plugin);
    const cache = cacheManager.forPlugin(plugin);
    return {
      logger,
      database,
      config,
      reader,
      discovery,
      tokenManager,
      permissions,
      scheduler,
      cache,
      identity
    };
  };
}

async function main() {
  const config = await loadBackendConfig({
    argv: process.argv,
    logger: getRootLogger(),
  });
  const createEnv = makeCreateEnv(config);

  const announcementsEnv = useHotMemoize(module, () => createEnv('announcements'));
  const catalogEnv = useHotMemoize(module, () => createEnv('catalog'));
  const authEnv = useHotMemoize(module, () => createEnv('auth'));
  const proxyEnv = useHotMemoize(module, () => createEnv('proxy'));
  const searchEnv = useHotMemoize(module, () => createEnv('search'));
  const techdocsEnv = useHotMemoize(module, () => createEnv('techdocs'));
  const todoEnv = useHotMemoize(module, () => createEnv('todo'));
  const todoListEnv = useHotMemoize(module, () => createEnv('todolist'));
  const appEnv = useHotMemoize(module, () => createEnv('app'));
  const badgesEnv = useHotMemoize(module, () => createEnv('badges'));
  const exploreEnv = useHotMemoize(module, () => createEnv('explore'));
  const permissionEnv = useHotMemoize(module, () => createEnv('permission'));
  const secretManagerEnv = useHotMemoize(module, () => createEnv('secretManager'));

  const apiRouter = Router();
  apiRouter.use('/announcements', await announcements(announcementsEnv));
  apiRouter.use('/catalog', await catalog(catalogEnv));
  apiRouter.use('/auth', await auth(authEnv));
  apiRouter.use('/search', await search(searchEnv));
  apiRouter.use('/techdocs', await techdocs(techdocsEnv));
  apiRouter.use('/todo', await todo(todoEnv));
  apiRouter.use('/todolist', await todoList(todoListEnv));
  apiRouter.use('/proxy', await proxy(proxyEnv));
  apiRouter.use('/badges', await badges(badgesEnv));
  apiRouter.use('/explore', await explore(exploreEnv));
  apiRouter.use('/permission', await permission(permissionEnv));
  apiRouter.use('/secretManager', await secretManager(secretManagerEnv));
  apiRouter.use(notFoundHandler());

  const service = createServiceBuilder(module)
    .loadConfig(config)
    .addRouter('/api', apiRouter)
    .addRouter('', await app(appEnv));

  await service.start().catch(err => {
    console.log(err);
    process.exit(1);
  });
}

module.hot?.accept();
main().catch(error => {
  console.error('Backend failed to start up', error);
  process.exit(1);
});
