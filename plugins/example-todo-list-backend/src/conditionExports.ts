import { TODO_LIST_RESOURCE_TYPE } from '@internal/plugin-todo-list-common';
import { createConditionExports } from '@backstage/plugin-permission-node';
import { rules } from './service/rules';

const { conditions, createConditionalDecision } = createConditionExports({
  pluginId: 'todolist',
  resourceType: TODO_LIST_RESOURCE_TYPE,
  rules,
});

export const todoListConditions = conditions;

export const createTodoListConditionalDecision = createConditionalDecision;