import { Page, Content, InfoCard } from '@backstage/core-components';
import { HomePageSearchBar } from '@backstage/plugin-search';
import { SearchContextProvider } from '@backstage/plugin-search-react';
import { Grid, makeStyles } from '@material-ui/core';
import React from 'react';
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";
import 'aws-sdk';

const util = require('util');
const useStyles = makeStyles(theme => ({
  searchBar: {
  display: 'flex',
  maxWidth: '60vw',
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[1],
  padding: '8px 0',
  borderRadius: '50px',
  margin: 'auto',
  },
}));

function getKeyValue() {
  let AWS = require('aws-sdk'),
    region = "us-east-1",
    secretName = "thien_secret_key",
    secret,
    decodedBinarySecret;

  AWS.config.update({
    accessKeyId: 'AKIA3RPHK4W6BPSIQGRG',
    secretAccessKey: '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',
  })

  // Create a Secrets Manager client
  let client = new AWS.SecretsManager({
      region: region
  });

  client.getSecretValue({SecretId: secretName}, function(err, data) {
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
        if ('SecretString' in data) {
            secret = data.SecretString;
            console.log(secret);
        } else {
            let buff = new Buffer(data.SecretBinary, 'base64');
            decodedBinarySecret = buff.toString('ascii');
        }
    }
    
    
});
}

export const SecretManagerPage = () => {
  /* We will shortly compose a pretty homepage here. */
  const classes = useStyles();
  let res =  getKeyValue();
  console.log(res);
    return (
    <SearchContextProvider>
        <Page themeId="home">
        <Content>
            <Grid container justifyContent="center" spacing={6}>
            <Grid container item xs={12} alignItems="center" direction="row">
                <HomePageSearchBar
                classes={{ root: classes.searchBar }}
                placeholder="Search"
                />
            </Grid>
            <Grid container item xs={12}>
                <Grid item xs={12} md={12}>
                <InfoCard title="List Key">
                    {/* placeholder for content */}
                    <div>Hi</div>
                </InfoCard>
                </Grid>
            </Grid>
            </Grid>
        </Content>
        </Page>
    </SearchContextProvider>
    );
};