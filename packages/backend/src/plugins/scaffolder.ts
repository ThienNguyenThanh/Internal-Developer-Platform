import { CatalogClient } from '@backstage/catalog-client';
import { createBuiltinActions, createRouter } from '@backstage/plugin-scaffolder-backend';
import { Router } from 'express';
import type { PluginEnvironment } from '../types';
// import { createAwsSecretsManagerCreateAction } from '@roadiehq/scaffolder-backend-module-aws';
import { ScmIntegrations } from '@backstage/integration';


export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  const catalogClient = new CatalogClient({
    discoveryApi: env.discovery,
  });
  const integrations = ScmIntegrations.fromConfig(env.config);

  const actions = [
    // createAwsSecretsManagerCreateAction(),
    ...createBuiltinActions({
      integrations,
      catalogClient,
      config: env.config,
      reader: env.reader,
    }),
  ];

  return await createRouter({
    logger: env.logger,
    config: env.config,
    database: env.database,
    reader: env.reader,
    catalogClient,
    actions,
    identity: env.identity,
  });
}
