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
import React, { useReducer, useRef, useState } from 'react';
import {
  Grid,
  TextField,
  Button,
  Dialog,
  Box,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@material-ui/core';
import {
  Header,
  Page,
  Content,
  ContentHeader,
  HeaderLabel,
  SupportButton,
} from '@backstage/core-components';
import { SecretForm, SecretInfo } from '../TodoList';
import {
  alertApiRef,
  discoveryApiRef,
  fetchApiRef,
  useApi,
} from '@backstage/core-plugin-api';
import { SecretList } from '../TodoList/TodoList';


export const TodoListPage = () => {
  const discoveryApi = useApi(discoveryApiRef);
  const { fetch } = useApi(fetchApiRef);
  const alertApi = useApi(alertApiRef);
  const [key, refetchTodos] = useReducer(i => i + 1, 0);
  const [editElement, setEdit] = useState<SecretInfo | undefined>();
  const [createElement, setCreate] = useState<SecretForm | undefined>();

  const handleAdd = async (newSecret: SecretForm) => {
    setCreate(undefined);
    try {
      const response = await fetch(
        `${await discoveryApi.getBaseUrl('todolist')}/todos`,
        {
          method: 'POST',
          body: JSON.stringify(newSecret),
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      if (!response.ok) {
        const { error } = await response.json();
        alertApi.post({
          message: error.message,
          severity: 'error',
        });
        return;
      }
      refetchTodos();
    } catch (e: any) {
      alertApi.post({ message: e.message, severity: 'error' });
    }
  };

  const handleEdit = async (updateSecret: SecretInfo) => {
    setEdit(undefined);
    try {
      const response = await fetch(
        `${await discoveryApi.getBaseUrl('todolist')}/todos`,
        {
          method: 'PUT',
          body: JSON.stringify(updateSecret),
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      if (!response.ok) {
        const { error } = await response.json();
        alertApi.post({
          message: error.message,
          severity: 'error',
        });
        return;
      }
      refetchTodos();
    } catch (e: any) {
      alertApi.post({ message: e.message, severity: 'error' });
    }
  };

  return (
    <Page themeId="tool">
      <Header
        title="Welcome to todo-list!"
        subtitle="Just a CRU todo list plugin"
      >
        <HeaderLabel label="Owner" value="Team X" />
        <HeaderLabel label="Lifecycle" value="Alpha" />
      </Header>
      <Content>
        <ContentHeader title="Todo List">
          <SupportButton>A description of your plugin goes here.</SupportButton>
        </ContentHeader>
        <Grid container spacing={3} direction="column">
          <Grid item>
            <AddTodo onAdd={setCreate} />
          </Grid>
          {/* <Grid item>
            <TodoList key={key} onEdit={setEdit} />
          </Grid> */}
          <Grid item>
            <SecretList key={key} onEdit={setEdit} />
          </Grid>
        </Grid>
      </Content>
      {!!editElement && (
        <EditModal
          updateSecret={editElement}
          onSubmit={handleEdit}
          onCancel={() => setEdit(undefined)}
        />
      )}
      {!!createElement && (
        <CreateModal
          onSubmit={handleAdd}
          onCancel={() => setCreate(undefined)}
        />
      )}
      
    </Page>
  );
};

function AddTodo({ onAdd }: { onAdd(todo: SecretForm): any }) {
  let inputSecret:SecretForm = {
    secretName: '', // required
    description: '',
    secretString: 'string',
    tags: [ // TagListType
      { // Tag
        key: '',
        value: '',
      }
    ]
  };

  return (
    <>
      <Box
        component="span"
        alignItems="flex-end"
        display="flex"
        flexDirection="row"
      >
        <Button variant="contained" onClick={() => onAdd(inputSecret)}>
          Create Secret
        </Button>
      </Box>
    </>
  );
}

function CreateModal({
  onCancel,
  onSubmit,
}: {
  onSubmit(t: SecretForm): any;
  onCancel(): any;
}) {
  const secretName = useRef('');
  const description = useRef('');
  const secretKey = useRef('');
  const secretValue = useRef('');
  const tagKey = useRef('');
  const tagValue = useRef('');
  return (
    <Dialog open>
      <DialogTitle id="form-dialog-title">Create Secret</DialogTitle>
      <DialogContent>
        <TextField
          required
          label="Secret Name"
          placeholder="Ex: so-secret1"
          defaultValue=''
          onChange={e => (secretName.current = e.target.value)}
          margin="dense"
          fullWidth
          autoFocus
        />
        <TextField
          label="Description"
          placeholder="Ex: Secret For DB"
          defaultValue=''
          onChange={e => (description.current = e.target.value)}
          margin="dense"
          fullWidth
        />
        <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            name="secret-key"
            fullWidth
            id="secret-key"
            label="Secret Key"
            onChange={e => (secretKey.current = e.target.value)}
          />
        </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="secret-value"
              label="Secret Value"
              name="secret-value"
              onChange={e => (secretValue.current = e.target.value)}
            />
          </Grid>
        </Grid>
        <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            autoComplete="given-name"
            name="tag-key"
            fullWidth
            id="tag-key"
            label="Tag Key"
            onChange={e => (tagKey.current = e.target.value)}
          />
        </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="tag-value"
              label="Tag Value"
              name="tag-value"
              onChange={e => (tagValue.current = e.target.value)}
            />
          </Grid>
        </Grid>
        
        
      </DialogContent>
      <DialogActions>
        <Button color="primary" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          onClick={() => onSubmit({
            secretName: secretName.current,
            description: description.current,
            secretString: `{"${secretKey.current}":"${secretValue.current}"}`,
            tags: [{
              key: `${tagKey.current}`,
              value: `${tagValue.current}`
            }],
          })}
          color="primary"
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function EditModal({
  updateSecret,
  onCancel,
  onSubmit,
}: {
  updateSecret: SecretInfo;
  onSubmit(t: SecretInfo): any;
  onCancel(): any;
}) {
  // const title = useRef('');
  const description = useRef('');
  const secretKey = useRef('');
  const secretValue = useRef('');
  return (
    <Dialog open>
      <DialogTitle id="form-dialog-title">Edit Secret</DialogTitle>
      <DialogContent>
        <TextField
          label="Secret Name"
          defaultValue={updateSecret.secretName || ''}
          margin="dense"
          fullWidth
          InputProps={{
            readOnly: true,
          }}
        />
        <TextField
          label="Description"
          defaultValue={updateSecret?.description || ''}
          onChange={e => (description.current = e.target.value)}
          margin="dense"
          fullWidth
        />
        <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            name="secret-key"
            fullWidth
            id="secret-key"
            label="Secret Key"
            onChange={e => (secretKey.current = e.target.value)}
          />
        </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="secret-value"
              label="Secret Value"
              name="secret-value"
              onChange={e => (secretValue.current = e.target.value)}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button color="primary" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          onClick={() => onSubmit({
            id: updateSecret.secretName,
            secretName: updateSecret.secretName,
            description: description.current,
            secretString: `{"${secretKey.current}":"${secretValue.current}"}`,
          })}
          color="primary"
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
