import { makeCreatePermissionRule } from '@backstage/plugin-permission-node';
import { TODO_LIST_RESOURCE_TYPE } from '@internal/plugin-secret-manager-common';
import { z } from 'zod';
import { Todo, TodoFilter } from './todos';

export const createTodoListPermissionRule = makeCreatePermissionRule<
  Todo,
  TodoFilter,
  typeof TODO_LIST_RESOURCE_TYPE
>();

export const isOwner = createTodoListPermissionRule({
  name: 'IS_OWNER',
  description: 'Should allow only if the todo belongs to the user',
  resourceType: TODO_LIST_RESOURCE_TYPE,
  paramsSchema: z.object({
    userId: z.string().describe('User ID to match on the resource'),
  }),
  apply: (resource: Todo, { userId }) => {
    return resource.owner === userId;
  },
  toQuery: ({ userId }) => {
    return {
      property: 'owner',
      values: [userId],
    };
  },
});

export const rules = { isOwner };