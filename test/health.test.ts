import { assert } from 'chai';

import { call, app } from './utils';

suite('health', () => {
  test('returns 200', async () => {
    const response = await call(app, '/health');

    assert.equal(response.statusCode, 200);

    const data = response.body;

    assert.isEmpty(data);
  });
});
