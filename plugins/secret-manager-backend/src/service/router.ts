/*
 * Copyright 2020 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { errorHandler } from '@backstage/backend-common';
import express from 'express';
import Router from 'express-promise-router';
import { Logger } from 'winston';
import { getAll,TodoFilter,getTodo } from './todos';
import { InputError, NotAllowedError } from '@backstage/errors';
import { getBearerTokenFromAuthorizationHeader, IdentityApi } from '@backstage/plugin-auth-node';
import { PermissionEvaluator, AuthorizeResult } from '@backstage/plugin-permission-common';
import {
  createPermissionIntegrationRouter,
  createConditionTransformer,
  ConditionTransformer,
} from '@backstage/plugin-permission-node';
import {
  TODO_LIST_RESOURCE_TYPE,
  todoListCreatePermission,
  todoListUpdatePermission,
  secretReadPermission
} from '@internal/plugin-secret-manager-common';
import { rules } from './rules';

/**
 * Dependencies of the todo-list router
 *
 * @public
 */
export interface RouterOptions {
  logger: Logger;
  identity: IdentityApi;
  permissions: PermissionEvaluator;
}

/**
 * Creates an express.Router with some endpoints
 * for creating, editing and deleting todo items.
 *
 * @public
 * @param options - the dependencies of the router
 * @returns an express.Router
 *
 */
export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, identity, permissions } = options;

  const permissionIntegrationRouter = createPermissionIntegrationRouter({
    permissions: [todoListCreatePermission, todoListUpdatePermission, secretReadPermission],
    getResources: async resourceRefs => {
      return resourceRefs.map(getTodo);
    },
    resourceType: TODO_LIST_RESOURCE_TYPE,
    rules: Object.values(rules),
  });

  const router = Router();
  router.use(express.json());

  router.get('/health', (_, response) => {
    logger.info('PONG!');
    response.json({ status: 'ok' });
  });

  router.use(permissionIntegrationRouter);

  const transformConditions: ConditionTransformer<TodoFilter> = createConditionTransformer(Object.values(rules));
  router.get('/todos', async (req, res) => {
    const token = getBearerTokenFromAuthorizationHeader(
      req.header('authorization'),
    );
  
    const decision = (
      await permissions.authorizeConditional([{ permission: secretReadPermission }], {
        token,
      })
    )[0];
  
    if (decision.result === AuthorizeResult.DENY) {
      throw new NotAllowedError('Unauthorized');
    }
  
    if (decision.result === AuthorizeResult.CONDITIONAL) {
      const filter = transformConditions(decision.conditions);
      res.json(getAll(filter));
    } else {
      res.json(getAll());
    }
  });

  // router.post('/todos', async (req, res) => {
  //   let author: string | undefined = undefined;

  //   const user = await identity.getIdentity({ request: req });
  //   author = user?.identity.userEntityRef;

  //   const token = getBearerTokenFromAuthorizationHeader(
  //     req.header('authorization'),
  //   );
  //   const decision = (
  //     await permissions.authorize([{ permission: todoListCreatePermission }], {
  //     token,
  //     })
  //   )[0];

  //   if (decision.result === AuthorizeResult.DENY) {
  //     throw new NotAllowedError('Unauthorized');
  //   }

  //   if (!isTodoCreateRequest(req.body)) {
  //     throw new InputError('Invalid payload');
  //   }

  //   const todo = add({ title: req.body.keyName, author });
  //   res.json(todo);
  // });

  // router.put('/todos', async (req, res) => {
  //   const token = getBearerTokenFromAuthorizationHeader(
  //     req.header('authorization'),
  //   );

  //   if (!isTodoUpdateRequest(req.body)) {
  //     throw new InputError('Invalid payload');
  //   }

  //   const decision = (
  //     await permissions.authorize(
  //       [{ permission: todoListUpdatePermission, resourceRef: req.body.id }],
  //       {
  //         token,
  //       },
  //     )
  //   )[0];
  
  //   if (decision.result !== AuthorizeResult.ALLOW) {
  //     throw new NotAllowedError('Unauthorized');
  //   }
  //   res.json(update(req.body));
  // });

  router.use(errorHandler());
  return router;
}

// function isTodoCreateRequest(request: any): request is { title: string } {
//   return typeof request?.title === 'string';
// }

// function isTodoUpdateRequest(
//   request: any,
// ): request is { title: string; id: string } {
//   return typeof request?.id === 'string' && isTodoCreateRequest(request);
// }
