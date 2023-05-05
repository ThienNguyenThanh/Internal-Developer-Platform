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
import { v4 as uuid } from 'uuid';
import { NotFoundError } from '@backstage/errors';
import { SecretsManagerClient, ListSecretsCommand } from "@aws-sdk/client-secrets-manager";
// import {dotev} from 'dotenv';

// dotev.config();

export type SecretInfo = {
  id: string;
  keyName: string;
  ARN: string;
  lastChangedDate: number;
  author: string;
  viewers: string;
};

export type Todo = {
  title: string;
  author?: string;
  id: string;
  timestamp: number;
};

export type TodoFilter = {
  property: Exclude<keyof Todo, 'timestamp'>;
  values: Array<string | undefined>;
};

export type TodoFilters =
  | {
      anyOf: TodoFilters[];
    }
  | { allOf: TodoFilters[] }
  | { not: TodoFilters }
  | TodoFilter;

export type SecretFilter = {
  property: Exclude<keyof SecretInfo, 'lastChangedDate'>;
  values: Array<string | undefined>;
};

export type SecretFilters =
  | {
      anyOf: SecretFilters[];
    }
  | { allOf: SecretFilters[] }
  | { not: SecretFilters }
  | SecretFilter;

const todos: { [key: string]: Todo } = {};
const secrets: { [key: string]: SecretInfo } = {};


const matches = (todo: Todo, filters?: TodoFilters): boolean => {
  if (!filters) {
    return true;
  }

  if ('allOf' in filters) {
    return filters.allOf.every(filter => matches(todo, filter));
  }

  if ('anyOf' in filters) {
    return filters.anyOf.some(filter => matches(todo, filter));
  }

  if ('not' in filters) {
    return !matches(todo, filters.not);
  }

  return filters.values.includes(todo[filters.property]);
};

const matchesSecret = (todo: SecretInfo, filters?: SecretFilters): boolean => {
  if (!filters) {
    return true;
  }

  if ('allOf' in filters) {
    return filters.allOf.every(filter => matchesSecret(todo, filter));
  }

  if ('anyOf' in filters) {
    return filters.anyOf.some(filter => matchesSecret(todo, filter));
  }

  if ('not' in filters) {
    return !matchesSecret(todo, filters.not);
  }

  return filters.values.includes(todo[filters.property]);
};

export function add(todo: Omit<Todo, 'id' | 'timestamp'>) {
  const id = uuid();

  const obj: Todo = { ...todo, id, timestamp: Date.now() };
  todos[id] = obj;
  return obj;
}

export function getTodo(id: string) {
  return todos[id];
}

export function getSecret(id: string) {
  return secrets[id];
}

export function update({ id, title }: { id: string; title: string }) {
  let todo = todos[id];
  if (!todo) {
    throw new NotFoundError('Item not found');
  }

  todo = { ...todo, title, timestamp: Date.now() };
  todos[id] = todo;
  return todo;
}

export function getAll(filter?: TodoFilters) {
  return Object.values(todos)
    .filter(value => matches(value, filter))
    .sort((a, b) => b.timestamp - a.timestamp);
}


export async function getAllSecret(filter?: SecretFilters) {
  
  let response:SecretInfo[] = [];
   
    const client = new SecretsManagerClient({ 
      region: "us-east-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY ?? 'foo',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? 'foo',
      }});
    const command = new ListSecretsCommand({
      Filters: [ 
        { 
            "Key": "tag-key",
            "Values": [ "admin" ]
        }
      ],
      MaxResults: 10,
    });
    try {
      const results = await client.send(command);
      // console.log(results.SecretList);
      let data = results.SecretList;
      // let newScret = {} as SecretInfo;
      for(let i=0; i< 3; i++) {
        if(data){
          // newScret.id =   data[i].Name!;
          // newScret.ARN =   data[i].ARN!;
          // newScret.keyName =   data[i].Name!;
          // newScret.lastChangedDate =   data[i].LastChangedDate!;
          // newScret.author =  "user:default/thiennguyenthanh";
          // response.push(newScret)
          response.push({
            "id":  data[i].Name!,
            "ARN": data[i].ARN!,
            "keyName": data[i].Name!,
            "lastChangedDate": 132,
            "author": "user:default/thiennguyenthanh",
            "viewers": "user:default/s3817852",
          })

          // let newScret:Omit<SecretInfo, 'id' | 'lastChangedDate'> = {
          //   ARN: data[i].ARN!,
          //   keyName: data[i].Name!,
          //   author: "user:default/thiennguyenthanh",
          //   viewers: "user:default/thiennguyenthanh, user:default/s3817852"
          // };

          // const id = uuid();

          // const obj: SecretInfo = { ...newScret, id, lastChangedDate: Date.now() };
          // secrets[id] = obj;
        }
      }
    } catch (err) {
      console.error(err);
    }
  
  // console.log(`response is ${response}`)

  // return response;
  return Object.values(response)
    .filter(value => matchesSecret(value, filter))
    .sort((a, b) => b.lastChangedDate - a.lastChangedDate);
}

// prepopulate the db
add({ title: 'just a note' });
add({ title: 'another note' });
