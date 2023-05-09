import { makeCreatePermissionRule } from '@backstage/plugin-permission-node';
import { TODO_LIST_RESOURCE_TYPE } from '@internal/plugin-todo-list-common';
import { z } from 'zod';
import {  SecretFilter, SecretInfo } from './todos';

// export const createTodoListPermissionRule = makeCreatePermissionRule<
//   Todo,
//   TodoFilter,
//   typeof TODO_LIST_RESOURCE_TYPE
// >();

export const secretCreateTodoListPermissionRule = makeCreatePermissionRule<
  SecretInfo,
  SecretFilter,
  typeof TODO_LIST_RESOURCE_TYPE
>();

// export const isVisible = secretCreateTodoListPermissionRule({
//   name: 'IS_VISIBLE',
//   description: 'Should visible only if user is in viewer list',
//   resourceType: TODO_LIST_RESOURCE_TYPE,
//   paramsSchema: z.object({
//     userId: z.array(z.string())
//   }),
//   apply: (resource: SecretInfo, { userId }) => {
//     return userId.includes(resource.viewers);
//   },
//   toQuery: ({ userId }) => {
//     return {
//       property: 'viewers',
//       values: userId,
//     };
//   },
// });

export const isOwner = secretCreateTodoListPermissionRule({
  name: 'IS_OWNER',
  description: 'Should allow only if user is owner of secret',
  resourceType: TODO_LIST_RESOURCE_TYPE,
  paramsSchema: z.object({
    userId: z.string()
  }),
  apply: (resource: SecretInfo, { userId }) => {
    return resource.owner === userId;
  },
  toQuery: ({ userId }) => {
    return {
      property: 'owner',
      values: [userId],
    };
  },
});

// export const isViewer = secretCreateTodoListPermissionRule({
//   name: 'IS_OWNER',
//   description: 'Should allow only if the todo belongs to the user',
//   resourceType: TODO_LIST_RESOURCE_TYPE,
//   paramsSchema: z.object({
//     userId: z.string().describe('User ID to match on the resource'),
//   }),
//   apply: (resource: SecretInfo, { userId }) => {
//     return resource.viewers.includes(userId);
//   },
//   toQuery: ({ userId }) => {
//     return {
//       property: 'viewers',
//       values: [userId],
//     };
//   },
// });

export const rules = { isOwner };
// export const ownerRules = { isOwner };
// export const viewerRules = { isViewer };