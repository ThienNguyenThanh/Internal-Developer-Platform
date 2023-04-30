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
import React from 'react';
import { Table, TableColumn, Progress } from '@backstage/core-components';
import Alert from '@material-ui/lab/Alert';
import useAsync from 'react-use/lib/useAsync';
// import {
//   discoveryApiRef,
//   fetchApiRef,
//   useApi,
// } from '@backstage/core-plugin-api';
import { Button } from '@material-ui/core';
// import {
//   SecretsManagerClient,
//   GetSecretValueCommand,
//   ListSecretsCommand
// } from "@aws-sdk/client-secrets-manager";
import 'aws-sdk';
import * as dotenv from 'dotenv'

dotenv.config();

export type SecretInfo = {
  id: string;
  keyName: string;
  ARN: string;
  lastChangedDate: number;
  owner: string;
};

type SecretInfoTableProps = {
  secretInfos: SecretInfo[];
  onEdit(secretInfo: SecretInfo): any;
};

export const SecretList = ({ onEdit }: { onEdit(todo: SecretInfo): any }) => {
  let AWS = require('aws-sdk'),
    region = "us-east-1";

  AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  })

  // Create a Secrets Manager client
  let client = new AWS.SecretsManager({
    region: region
  });

  let params = {
      Filters: [ 
        { 
            "Key": "tag-key",
            "Values": [ "admin" ]
        }
      ],
      MaxResults: 10,
  }
  

  function getListOfSecret( response:SecretInfo[] ){
    return new Promise( (resolve, reject) => {
      client.listSecrets(params, function(err:any, res:any) {
        if (err) {
          reject(err);
        }
        else {
          console.log("set up request")
          var awsKey;
          var data = res.SecretList;
          for(awsKey in data) {
              response.push({
                "id":  data[awsKey].Name,
                "ARN": data[awsKey].ARN,
                "keyName": data[awsKey].Name,
                "lastChangedDate": data[awsKey].LastChangedDate,
                "owner": "user:admin/thiennguyenthanh",
              })
          }
          resolve(response)
        }});
    })
  }

  const { value, loading, error } = useAsync(async (): Promise<SecretInfo[]> => {
    let response:SecretInfo[] =[];
    await getListOfSecret(response);

    return response;
  }, []);

  if (loading) {
    return <Progress />;
  } else if (error) {
    return <Alert severity="error">{error.message}</Alert>;
  }

  return <SecretInfoTable secretInfos={value || []} onEdit={onEdit} />;
};

export function SecretInfoTable({ secretInfos, onEdit }: SecretInfoTableProps) {
  const columns: TableColumn<SecretInfo>[] = [
    { title: 'Key-Name', field: 'keyName' },
    { title: 'ARN', field: 'ARN' },
    {
      title: 'Last edit',
      field: 'lastChangedDate',
      render: e => new Date(e.lastChangedDate).toLocaleString(),
    },
    { title: 'Owner', field: 'owner' },
    { title: 'Viewer', field:'some viewers' },
    {
      title: 'Action',
      render: todo => {
        return (
          <Button variant="contained" onClick={() => onEdit(todo)}>
            Edit
          </Button>
        );
      },
    },
  ];

  return (
    <Table
      title="Todos"
      options={{ search: false, paging: false }}
      columns={columns}
      data={secretInfos}
    />
  );
}
