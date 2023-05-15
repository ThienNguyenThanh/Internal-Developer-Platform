import { eventLogPlugin } from './plugin';

describe('event-log', () => {
  it('should export plugin', () => {
    expect(eventLogPlugin).toBeDefined();
  });
});
