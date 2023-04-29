import { TODO_LIST_RESOURCE_TYPE } from '@internal/plugin-secret-manager-common';
import { createConditionExports } from '@backstage/plugin-permission-node';
import { rules } from './service/rules';

const { conditions, createConditionalDecision } = createConditionExports({
  pluginId: 'secretManager',
  resourceType: TODO_LIST_RESOURCE_TYPE,
  rules,
});

export const todoListConditions = conditions;

export const createTodoListConditionalDecision = createConditionalDecision;