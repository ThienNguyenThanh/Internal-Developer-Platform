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
// import { NotFoundError } from '@backstage/errors';
import { SecretsManagerClient, ListSecretsCommand, CreateSecretCommand, UpdateSecretCommand, Tag } from "@aws-sdk/client-secrets-manager";
// import {dotev} from 'dotenv';

// dotev.config();

export type SecretInfo = {
  id: string;
  secretName: string;
  ARN: string;
  lastChangedDate?: Date;
  description?: string;
  secretString?: string;
  owner?: string,
  viewer?: string,
};

export type Todo = {
  title: string;
  author?: string;
  id: string;
  timestamp: number;
};

export type SecretForm = {
  secretName: string; // required
  description?: string;
  secretString?: string;
  tags?: Tag[]
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

export async function createSecret(newScret: SecretForm, owner?: string) {
  // let response:SecretForm[] = [];
  console.log(owner)
   
    const client = new SecretsManagerClient({ 
      region: "us-east-1",
      credentials: {
        accessKeyId: 'AKIA25TZ5AVSD7GXIBUX',
        secretAccessKey: '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'
        
      }});

    const command = new CreateSecretCommand({
      Name: newScret.secretName,
      Description: newScret.description ,
      SecretString: newScret.secretString
    });
    try {
      const results = await client.send(command);

      console.log(results);
      
    } catch (err) {
      console.error(err);
    }
  
  // console.log(`response is ${response}`)

  // return response;
}

export async function updateSecret(updateScret: SecretInfo) {
  const client = new SecretsManagerClient({ 
    region: "us-east-1",
    credentials: {
      accessKeyId: 'AKIA25TZ5AVSD7GXIBUX',
      secretAccessKey: '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'
      
    }});

  const command = new UpdateSecretCommand({
    SecretId: updateScret.secretName,
    Description: updateScret.description ,
    SecretString: updateScret.secretString
  });
  try {
    const results = await client.send(command);

    console.log(results);
    
  } catch (err) {
    console.error(err);
  }

  // let todo = todos[id];
  // if (!todo) {
  //   throw new NotFoundError('Item not found');
  // }

  // todo = { ...todo, title, timestamp: Date.now() };
  // todos[id] = todo;
  // return todo;
}

export function getAll(filter?: TodoFilters) {
  return Object.values(todos)
    .filter(value => matches(value, filter))
    .sort((a, b) => b.timestamp - a.timestamp);
}


export async function getSecretsForAdmin(viewer:string) {
  console.log(viewer)
  let response:SecretInfo[] = [];
   
    const client = new SecretsManagerClient({ 
      region: "us-east-1",
      credentials: {
        accessKeyId: 'AKIA25TZ5AVSD7GXIBUX',
        secretAccessKey: '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',
      }});
    const command = new ListSecretsCommand({
      MaxResults: 10,
    });
    try {
      const results = await client.send(command);
      // console.log(results.SecretList);
      if(results.SecretList){
        let data = results.SecretList;
        

        // let newScret = {} as SecretInfo;
        for(let i=0; i< data?.length; i++) {
            if(data){
              let tagViewerValue : string = '',
              tagOwnerValue : string = '';
            data[i].Tags?.map((tag) => {
              if(tag.Key == 'owner' && !tagOwnerValue){
                tagOwnerValue = tag.Value ?? '';
              }
              if(tag.Key == 'viewer' && !tagViewerValue){
                tagViewerValue = tag.Value ?? '';
              }
              
            })
            response.push({
              "id":  data[i].Name!,
              "ARN": data[i].ARN!,
              "secretName": data[i].Name!,
              "lastChangedDate": data[i].LastChangedDate,
              "description": data[i].Description,
              "owner": tagOwnerValue,
              "viewer": tagViewerValue,         
            })
          }
          
        }
    }
    } catch (err) {
      console.error(err);
    }

  return response;
}

export async function getSecretsForDev(viewer:string ) {
  console.log(viewer)
  
  let response:SecretInfo[] = [];
   
    const client = new SecretsManagerClient({ 
      region: "us-east-1",
      credentials: {
        accessKeyId: 'AKIA25TZ5AVSD7GXIBUX',
        secretAccessKey: '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',
      }});
    const command = new ListSecretsCommand({
      MaxResults: 10,
    });
    try {
      const results = await client.send(command);
      // let newScret = {} as SecretInfo;
      if(results.SecretList){
        let data = results.SecretList;
        

        // let newScret = {} as SecretInfo;
        for(let i=0; i< data?.length; i++) {
        if(data){
          let tagViewerValue : string = '',
          tagOwnerValue : string = '';
          
          data[i].Tags?.map((tag) => {
            if(tag.Key == 'owner' && !tagOwnerValue){
              tagOwnerValue = tag.Value ?? '';
            }
            if(tag.Key == 'viewer' && !tagViewerValue){
              tagViewerValue = tag.Value ?? '';
            }
            
          })

          response.push({
            "id":  data[i].Name!,
            "ARN": data[i].ARN!,
            "secretName": data[i].Name!,
            "lastChangedDate": data[i].LastChangedDate,
            "owner": tagOwnerValue,
            "viewer": tagViewerValue,    
          })
        }
        }
      }
    } catch (err) {
      console.error(err);
    }
  
  // console.log(`response is ${response}`)

  return response;
  // return Object.values(response)
  //   .filter(value => matchesSecret(value, filter))
  //   .sort((a, b) => b.lastChangedDate - a.lastChangedDate);
}

export async function getSecretsForViewer() {
  
  let response:SecretInfo[] = [];
   
    const client = new SecretsManagerClient({ 
      region: "us-east-1",
      credentials: {
        accessKeyId: 'AKIA25TZ5AVSD7GXIBUX',
        secretAccessKey: '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',
      }});
    const command = new ListSecretsCommand({
      MaxResults: 10,
    });
    try {
      const results = await client.send(command);
      // console.log(results.SecretList);
      let data = results.SecretList;
      

        
      for(let i=0; i< 3; i++) {

          
          if(data){
            let tagViewerValue : string = '',
            tagOwnerValue : string = '';

            data[i].Tags?.map((tag) => {
              if(tag.Key == 'owner' && !tagOwnerValue){
                tagOwnerValue = tag.Value ?? '';
              }
              if(tag.Key == 'viewer' && !tagViewerValue){
                tagViewerValue = tag.Value ?? '';
              }
              
            })

          response.push({
            "id":  data[i].Name!,
            "ARN": data[i].ARN!,
            "secretName": data[i].Name!,
            "lastChangedDate": data[i].LastChangedDate,
            "owner": tagOwnerValue,
            "viewer": tagViewerValue,
          })
        
      }
      }
    } catch (err) {
      console.error(err);
    }
  
  // console.log(`response is ${response}`)

  return response;
  // return Object.values(response)
  //   .filter(value => matchesSecret(value, filter))
  //   .sort((a, b) => b.lastChangedDate - a.lastChangedDate);
}

// prepopulate the db
add({ title: 'just a note' });
add({ title: 'another note' });
