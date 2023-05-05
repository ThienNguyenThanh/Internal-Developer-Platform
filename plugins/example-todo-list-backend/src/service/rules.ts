import { makeCreatePermissionRule } from '@backstage/plugin-permission-node';
import { TODO_LIST_RESOURCE_TYPE } from '@internal/plugin-todo-list-common';
import { z } from 'zod';
import { Todo, TodoFilter, SecretFilter, SecretInfo } from './todos';

export const createTodoListPermissionRule = makeCreatePermissionRule<
  Todo,
  TodoFilter,
  typeof TODO_LIST_RESOURCE_TYPE
>();

export const secretCreateTodoListPermissionRule = makeCreatePermissionRule<
  SecretInfo,
  SecretFilter,
  typeof TODO_LIST_RESOURCE_TYPE
>();

export const isOwner = secretCreateTodoListPermissionRule({
  name: 'IS_OWNER',
  description: 'Should allow only if the todo belongs to the user',
  resourceType: TODO_LIST_RESOURCE_TYPE,
  paramsSchema: z.object({
    userId: z.array(z.string())
  }),
  apply: (resource: SecretInfo, { userId }) => {
    return userId.includes(resource.viewers);
  },
  toQuery: ({ userId }) => {
    return {
      property: 'viewers',
      values: userId,
    };
  },
});

export const isAuthor = secretCreateTodoListPermissionRule({
  name: 'IS_AUTHOR',
  description: 'Should allow only if the todo belongs to the user',
  resourceType: TODO_LIST_RESOURCE_TYPE,
  paramsSchema: z.object({
    userId: z.string().describe('User ID to match on the resource'),
  }),
  apply: (resource: SecretInfo, { userId }) => {
    return resource.author === userId;
  },
  toQuery: ({ userId }) => {
    return {
      property: 'author',
      values: [userId],
    };
  },
});

export const isViewer = secretCreateTodoListPermissionRule({
  name: 'IS_OWNER',
  description: 'Should allow only if the todo belongs to the user',
  resourceType: TODO_LIST_RESOURCE_TYPE,
  paramsSchema: z.object({
    userId: z.string().describe('User ID to match on the resource'),
  }),
  apply: (resource: SecretInfo, { userId }) => {
    return resource.viewers.includes(userId);
  },
  toQuery: ({ userId }) => {
    return {
      property: 'viewers',
      values: [userId],
    };
  },
});

export const rules = { isOwner };
export const authorRules = { isAuthor };
export const viewerRules = { isViewer };