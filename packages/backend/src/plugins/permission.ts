import {
  BackstageIdentityResponse,
} from '@backstage/plugin-auth-node';
import { createRouter } from '@backstage/plugin-permission-backend';
import {
  AuthorizeResult,
  PolicyDecision,
} from '@backstage/plugin-permission-common';
import {
    PermissionPolicy,
    PolicyQuery,
  } from '@backstage/plugin-permission-node';
import { Router } from 'express';
import { PluginEnvironment } from '../types';
import { isPermission } from '@backstage/plugin-permission-common';
// import {
//   todoListCreatePermission,
//   todoListUpdatePermission,
//   todoListReadPermission
// } from '@internal/plugin-secret-manager-common';
// import {
//   todoListConditions,
//   createTodoListConditionalDecision,
// } from '@internal/plugin-secret-manager-backend';

class TestPermissionPolicy implements PermissionPolicy {
  async handle(): Promise<PolicyDecision> {
    return { result: AuthorizeResult.ALLOW };
  }
  // async handle(
  //   request: PolicyQuery,
  //   user?: BackstageIdentityResponse,
  // ): Promise<PolicyDecision> {
  //   if (isPermission(request.permission, todoListCreatePermission)) {
  //     return {
  //       result: AuthorizeResult.ALLOW,
  //     };
  //   }

  //   if ( 
  //     isPermission(request.permission, todoListUpdatePermission) ||
  //     isPermission(request.permission, todoListReadPermission)
  //   ) {
  //     return createTodoListConditionalDecision(
  //       request.permission,
  //       todoListConditions.isOwner({
  //         userId: user?.identity.userEntityRef ?? '',
  //       }),
  //     );
  //   }

    // return {
    //   result: AuthorizeResult.ALLOW,
    // };
  // }
}

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  return await createRouter({
    config: env.config,
    logger: env.logger,
    discovery: env.discovery,
    policy: new TestPermissionPolicy(),
    identity: env.identity,
  });
}