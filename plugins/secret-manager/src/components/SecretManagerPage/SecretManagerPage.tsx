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
  Typography,
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
  HeaderLabel,
} from '@backstage/core-components';
import { SecretInfo, SecretList } from '../SecretManager';
import {
  alertApiRef,
  discoveryApiRef,
  fetchApiRef,
  useApi,
} from '@backstage/core-plugin-api';
import { Todo } from '@internal/plugin-secret-manager-backend/src/service/todos';

export const SecretManagerPage = () => {
  const discoveryApi = useApi(discoveryApiRef);
  const { fetch } = useApi(fetchApiRef);
  const alertApi = useApi(alertApiRef);
  const [key, refetchTodos] = useReducer(i => i + 1, 0);
  const [editElement, setEdit] = useState<SecretInfo | undefined>();
  

  const handleAdd = async (title: string) => {
    try {
      const response = await fetch(
        `${await discoveryApi.getBaseUrl('todolist')}/todos`,
        {
          method: 'POST',
          body: JSON.stringify({ title }),
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

  const handleEdit = async (todo: SecretInfo) => {
    setEdit(undefined);
    try {
      const response = await fetch(
        `${await discoveryApi.getBaseUrl('todolist')}/todos`,
        {
          method: 'PUT',
          body: JSON.stringify({ title: todo.keyName, id: todo.id }),
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
        title="Secret Manager"
        subtitle="List of secret key in AWS"
      >
        <HeaderLabel label="Owner" value="Team X" />
        <HeaderLabel label="Lifecycle" value="Alpha" />
      </Header>
      <Content>
        <Grid container spacing={3} direction="column">
          <Grid item>
            <AddTodo onAdd={handleAdd} />
          </Grid>
          <Grid item>
            <SecretList key={key} onEdit={setEdit} />
          </Grid>
        </Grid>
      </Content>
      {!!editElement && (
        <EditModal
          todo={editElement}
          onSubmit={handleEdit}
          onCancel={() => setEdit(undefined)}
        />
      )}
    </Page>
  );
};

function AddTodo({ onAdd }: { onAdd: (title: string) => any }) {
  const title = useRef('');

  return (
    <>
      <Typography variant="body1">Add key</Typography>
      <Box
        component="span"
        alignItems="flex-end"
        display="flex"
        flexDirection="row"
      >
        <TextField
          placeholder="Write something here..."
          onChange={e => (title.current = e.target.value)}
        />
        <Button variant="contained" onClick={() => onAdd(title.current)}>
          Add
        </Button>
      </Box>
    </>
  );
}

function EditModal({
  todo,
  onCancel,
  onSubmit,
}: {
  todo?: Todo;
  secretValue?: string;
  onSubmit(t: Todo): any;
  onCancel(): any;
}) {
  const title = useRef('');
  return (
    <Dialog open>
      <DialogTitle id="form-dialog-title">Edit item</DialogTitle>
      <DialogContent>
        <TextField
          placeholder="Write something here..."
          defaultValue={todo?.keyName || ''}
          onChange={e => (title.current = e.target.value)}
          margin="dense"
          fullWidth
        />
      </DialogContent>
      <DialogActions>
        <Button color="primary" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          onClick={() => onSubmit({ ...todo!, keyName: title.current })}
          color="primary"
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
