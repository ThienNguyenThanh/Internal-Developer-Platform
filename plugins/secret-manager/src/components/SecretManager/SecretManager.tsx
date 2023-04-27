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
import {
  discoveryApiRef,
  fetchApiRef,
  useApi,
} from '@backstage/core-plugin-api';
import { Button } from '@material-ui/core';
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";
import 'aws-sdk';


export type SecretInfo = {
  title: string;
  id: string;
  author?: string;
  timestamp: number;
};

type SecretInfoTableProps = {
  secretInfos: SecretInfo[];
  onEdit(secretInfo: SecretInfo): any;
};

export const SecretList = ({ onEdit }: { onEdit(todo: SecretInfo): any }) => {
  const discoveryApi = useApi(discoveryApiRef);
  const { fetch } = useApi(fetchApiRef);
  let AWS = require('aws-sdk'),
    region = "us-east-1",
    secretName = "key1",
    secret,
    decodedBinarySecret;

  AWS.config.update({
    accessKeyId: 'AKIA3RPHK4W6COZFNDAQ',
    secretAccessKey: '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',
  })

  // Create a Secrets Manager client
  let client = new AWS.SecretsManager({
      region: region
  });
  let params = {
      "Filters": [ 
         { 
            "Key": "tag-key",
            "Values": [ "admin" ]
         }
      ],
      "MaxResults": 10,
  }

  client.listSecrets(params, function(err, data) {
    if (err) {
        if (err.code === 'DecryptionFailureException')
            // Secrets Manager can't decrypt the protected secret text using the provided KMS key.
            // Deal with the exception here, and/or rethrow at your discretion.
            throw err;
        else if (err.code === 'InternalServiceErrorException')
            // An error occurred on the server side.
            // Deal with the exception here, and/or rethrow at your discretion.
            throw err;
        else if (err.code === 'InvalidParameterException')
            // You provided an invalid value for a parameter.
            // Deal with the exception here, and/or rethrow at your discretion.
            throw err;
        else if (err.code === 'InvalidRequestException')
            // You provided a parameter value that is not valid for the current state of the resource.
            // Deal with the exception here, and/or rethrow at your discretion.
            throw err;
        else if (err.code === 'ResourceNotFoundException')
            // We can't find the resource that you asked for.
            // Deal with the exception here, and/or rethrow at your discretion.
            throw err;
    }
    else {
        // Decrypts secret using the associated KMS CMK.
        // Depending on whether the secret is a string or binary, one of these fields will be populated.
        // if ('SecretString' in data) {
        //     secret = data.SecretString;
        //     console.log(secret);
        // } else {
        //     let buff = new Buffer(data.SecretBinary, 'base64');
        //     decodedBinarySecret = buff.toString('ascii');
        // }
        console.log(data)
    }});


  const { value, loading, error } = useAsync(async (): Promise<SecretInfo[]> => {
    // try {
    //   awsRes = await client.send(
    //     new GetSecretValueCommand({
    //       SecretId: "key1",
    //       VersionStage: "AWSCURRENT", // VersionStage defaults to AWSCURRENT if unspecified
    //     })
    //   );
    // } catch (error) {
    //   // For a list of exceptions thrown, see
    //   // https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
    //   throw error;
    // }
    const response = await fetch(
      `${await discoveryApi.getBaseUrl('todolist')}/todos`,
    );
    // const secret = await client.send(command);
    // const secret = awsRes.SecretString;
    // console.log(secret);

    return response.json();
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
    { title: 'Title', field: 'title' },
    { title: 'Author', field: 'author' },
    {
      title: 'Last edit',
      field: 'timestamp',
      render: e => new Date(e.timestamp).toLocaleString(),
    },
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
