import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { eventLogPlugin, EventLogPage } from '../src/plugin';

createDevApp()
  .registerPlugin(eventLogPlugin)
  .addPage({
    element: <EventLogPage />,
    title: 'Root Page',
    path: '/event-log'
  })
  .render();
