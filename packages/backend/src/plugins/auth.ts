import { createRouter, providers, defaultAuthProviderFactories } from '@backstage/plugin-auth-backend';
import { Router } from 'express';
import { PluginEnvironment } from '../types';

export default async function createPlugin({
  logger,
  database,
  config,
  discovery,
  tokenManager,
}: PluginEnvironment): Promise<Router> {
  return await createRouter({
    logger,
    config,
    database,
    discovery,
    tokenManager,
    providerFactories: {
      ...defaultAuthProviderFactories,

      // This replaces the default GitHub auth provider with a customized one.
      // The `signIn` option enables sign-in for this provider, using the
      // identity resolution logic that's provided in the `resolver` callback.
      //
      // This particular resolver makes all users share a single "guest" identity.
      // It should only be used for testing and trying out Backstage.
      //
      // If you want to use a production ready resolver you can switch to
      // the one that is commented out below, it looks up a user entity in the
      // catalog using the GitHub username of the authenticated user.
      // That resolver requires you to have user entities populated in the catalog,
      // for example using https://backstage.io/docs/integrations/github/org
      //
      // There are other resolvers to choose from, and you can also create
      // your own, see the auth documentation for more details:
      //
      //   https://backstage.io/docs/auth/identity-resolver
      github: providers.github.create({
        signIn: {
          async resolver({ result: { fullProfile } }, ctx) {
            const userId = fullProfile.username;
            if (!userId) {
              throw new Error(
                `GitHub user profile does not contain a username`,
              );
            }

            let userEntityRef = {
                  kind: 'User',
                  name: userId,
                  namespace: 'default',
            };

            let ownershipEntityRef = {
              kind: 'User',
              name: userId,
              namespace: 'default',
            };
            if(userId == 'ThienNguyenThanh'){
              ownershipEntityRef = {
                kind: 'User',
                name: 'admin',
                namespace: 'default',
              };
            }else if(userId == 'S3817852'){
              ownershipEntityRef = {
                kind: 'User',
                name: 'developer',
                namespace: 'default',
              };
            }else{
              ownershipEntityRef = {
                kind: 'User',
                name: 'viewer',
                namespace: 'default',
              };
            }

            const stringifyUserEntityRef = `${userEntityRef.kind.toLocaleLowerCase('en-US',
                                            )}:${userEntityRef.namespace.toLocaleLowerCase('en-US',
                                            )}/${userEntityRef.name.toLocaleLowerCase('en-US')}`

            const stringifyOwnershipEntityRef = `${ownershipEntityRef.kind.toLocaleLowerCase('en-US',
                                                )}:${ownershipEntityRef.namespace.toLocaleLowerCase('en-US',
                                                )}/${ownershipEntityRef.name.toLocaleLowerCase('en-US')}`

            return ctx.issueToken({
              claims: {
                sub: stringifyUserEntityRef,
                ent: [stringifyOwnershipEntityRef],
              },
            });
          },
        },
      }),
    },
  });
}
