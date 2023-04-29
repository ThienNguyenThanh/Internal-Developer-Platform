/*
 * Copyright 2022 The Backstage Authors
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

import { createPermission } from '@backstage/plugin-permission-common';


export const TODO_LIST_RESOURCE_TYPE = 'todo-item';
/**
 * An example of a permission.
 *
 * @public
 */
export const secretReadPermission = createPermission({
  name: 'todo.list.read',
  attributes: { action: 'read' },
  resourceType: TODO_LIST_RESOURCE_TYPE,
});

export const todoListCreatePermission = createPermission({
  name: 'todo.list.create',
  attributes: { action: 'create' },
});

export const todoListUpdatePermission = createPermission({
  name: 'todo.list.update',
  attributes: { action: 'update' },
  resourceType: TODO_LIST_RESOURCE_TYPE,
});


/**
 * List of all todo list permissions.
 *
 * @public
 */
export const todoListPermissions = [
  todoListCreatePermission,
  todoListUpdatePermission,
  secretReadPermission,
];
