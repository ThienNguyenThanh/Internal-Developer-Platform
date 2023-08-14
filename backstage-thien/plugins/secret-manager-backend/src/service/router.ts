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
import {  updateSecret, getSecretsForAdmin,getSecretsForDev, getSecretsForViewer , getSecret, createSecret } from './todos';
import { rules } from './rules';
import { InputError } from '@backstage/errors';
import {  IdentityApi } from '@backstage/plugin-auth-node';
import { PermissionEvaluator } from '@backstage/plugin-permission-common';
import {
  createPermissionIntegrationRouter,
  // createConditionTransformer,
  // ConditionTransformer,
} from '@backstage/plugin-permission-node';
import {
  TODO_LIST_RESOURCE_TYPE,
  todoListCreatePermission,
  todoListUpdatePermission,
  todoListReadPermission
} from '@internal/plugin-secret-manager-common';

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
  const { logger, identity } = options;

  const permissionIntegrationRouter = createPermissionIntegrationRouter({
    permissions: [todoListCreatePermission, todoListUpdatePermission, todoListReadPermission],
    getResources: async resourceRefs => {
      return resourceRefs.map(getSecret);
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

  // const transformConditions: ConditionTransformer<TodoFilter> = createConditionTransformer(Object.values(authorRules));
  // router.get('/todos', async (req, res) => {
  //   const token = getBearerTokenFromAuthorizationHeader(
  //     req.header('authorization'),
  //   );
  
  //   const decision = (
  //     await permissions.authorizeConditional([{ permission: todoListReadPermission }], {
  //       token,
  //     })
  //   )[0];
  
  //   if (decision.result === AuthorizeResult.DENY) {
  //     throw new NotAllowedError('Unauthorized');
  //   }
  //   if (decision.result === AuthorizeResult.CONDITIONAL) {
  //     const filter = transformConditions(decision.conditions);
  //     res.json(getAll(filter));
  //   } else {
  //     res.json(getAll());
  //   }
  // });

  // const secretTransformConditions: ConditionTransformer<SecretFilter> = createConditionTransformer(Object.values(rules));
  router.get('/secrets',async (req, res) => {
    const user = await identity.getIdentity({ request: req });
    const ownership = user?.identity.ownershipEntityRefs
    const author = user?.identity.userEntityRef ?? 'unrecognized-user';
    // if
    console.log(`author is ${author}`)
    console.log(`ownership is ${ownership}`)

    // const token = getBearerTokenFromAuthorizationHeader(
    //   req.header('authorization'),
    // );
  
    // const decision = (
    //   await permissions.authorizeConditional([{ permission: todoListReadPermission }], {
    //     token,
    //   })
    // )[0];
  
    // if (decision.result === AuthorizeResult.DENY) {
    //   throw new NotAllowedError('Unauthorized');
    // }
    // if (decision.result === AuthorizeResult.CONDITIONAL) {
    //   const filter = secretTransformConditions(decision.conditions);
    //   // res.json(await getSecretsForAdmin());


    //   // Check ownership for authorized page.
    //   if(ownership?.includes('admin')){
    //     res.json(await getSecretsForAdmin(author));
    //   } else if(ownership?.includes('developer')){
    //     res.json(await getSecretsForDev(author, filter ));
    //   } else {
    //     res.json(await getSecretsForViewer(filter));
    //   }
      
    // } 
    if(ownership?.includes('admin')){
      res.json(await getSecretsForAdmin(author));
    } else if(ownership?.includes('developer')){
      res.json(await getSecretsForDev(author ));
    } else {
      res.json(await getSecretsForViewer());
    }

  })

  router.post('/secret', async (req, res) => {
    let author: string | undefined = undefined;

    const user = await identity.getIdentity({ request: req });
    author = user?.identity.userEntityRef;

    // console.log(`Resquest body is ${JSON.stringify(req.body)}`)
    
    // const token = getBearerTokenFromAuthorizationHeader(
    //   req.header('authorization'),
    // );
    // const decision = (
    //   await permissions.authorize([{ permission: todoListCreatePermission }], {
    //   token,
    //   })
    // )[0];

    // if (decision.result === AuthorizeResult.DENY) {
    //   throw new NotAllowedError('Unauthorized');
    // }
    // console.log(`Request body is ${JSON.stringify(req.body)}`)
    if (!req.body.secretName) {
      throw new InputError('Invalid Secret Name');
    }

    await createSecret(req.body, author);
    // const todo = add({ title: req.body.title, author });
    res.json(req.body);
  });

  router.put('/secret', async (req, res) => {
    // const token = getBearerTokenFromAuthorizationHeader(
    //   req.header('authorization'),
    // );
    const user = await identity.getIdentity({ request: req });
    const ownership = user?.identity.ownershipEntityRefs[0]
    // const author = user?.identity.userEntityRef ?? 'unrecognized-user';

    if (!req.body.secretName) {
      throw new InputError('Invalid Secret Name');
    }

    if(ownership?.includes('admin')){
      res.json(await updateSecret(req.body));
    } else {
      throw new InputError('Do not have permission');
    }

    // const decision = (
    //   await permissions.authorize(
    //     [{ permission: todoListUpdatePermission, resourceRef: req.body.id }],
    //     {
    //       token,
    //     },
    //   )
    // )[0];
  
    // if (decision.result !== AuthorizeResult.ALLOW) {
    //   throw new NotAllowedError('Unauthorized');
    // }
    // res.json(await updateSecret(req.body));
    // console.log(`Request body is ${JSON.stringify(req.body)}`)
    // await updateSecret(req.body)
  });

  router.use(errorHandler());
  return router;
}

// function isTodoCreateRequest(request: any): request is { title: string } {
//   return typeof request?.title === 'string';
// }

// function isTodoUpdateRequest(
//   request: any,
// ): request is { secretId: string } {
//   return typeof request.secretId === 'string' && request?.secretId;
// }
