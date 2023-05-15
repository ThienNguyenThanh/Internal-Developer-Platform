// import { createPlugin, createRoutableExtension } from '@backstage/core-plugin-api';

// import { rootRouteRef } from './routes';

// export const eventLogPlugin = createPlugin({
//   id: 'event-log',
//   routes: {
//     root: rootRouteRef,
//   },
// });

// export const EventLogPage = eventLogPlugin.provide(
//   createRoutableExtension({
//     name: 'EventLogPage',
//     component: () =>
//       import('./components/ExampleComponent').then(m => m.ExampleComponent),
//     mountPoint: rootRouteRef,
//   }),
// );
