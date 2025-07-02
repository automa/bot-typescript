import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { LightMyRequestResponse } from 'fastify';
import { assert } from 'chai';
import sinon, { SinonStub } from 'sinon';
import { CodeFolder, generateWebhookSignature } from '@automa/bot';

import { call, app } from './utils';

import { automa } from '../src';
import { env } from '../src/env';

const payload = {
  id: 'whmsg_1',
  timestamp: '2025-05-30T09:30:06.261Z',
  type: 'task.created',
};

const callWithFixture = async (fileName: string) => {
  const body = JSON.parse(
    readFileSync(join(__dirname, 'fixtures', `${fileName}.json`), 'utf8'),
  );

  const signature = generateWebhookSignature(env.AUTOMA.WEBHOOK_SECRET, body);

  return call(app, '/automa', {
    method: 'POST',
    headers: {
      'webhook-signature': signature,
      'x-automa-server-host': 'https://api.automa.app',
    },
    payload: body,
  });
};

suite('automa hook', () => {
  let response: LightMyRequestResponse;
  let downloadStub: SinonStub, proposeStub: SinonStub, cleanupStub: SinonStub;

  setup(() => {
    downloadStub = sinon
      .stub(automa.code, 'download')
      .resolves(new CodeFolder(join(__dirname, 'fixtures', 'code')));

    proposeStub = sinon.stub(automa.code, 'propose').resolves();

    cleanupStub = sinon.stub(automa.code, 'cleanup').resolves();
  });

  teardown(() => {
    downloadStub.restore();
    proposeStub.restore();
    cleanupStub.restore();
  });

  test('with non task.created event should return 204', async () => {
    const response = await call(app, '/automa', {
      method: 'POST',
      headers: {},
      payload: {
        ...payload,
        type: 'proposal.rejected',
      },
    });

    assert.equal(response.statusCode, 204);
  });

  test('with no signature should return 401', async () => {
    const response = await call(app, '/automa', {
      method: 'POST',
      headers: {},
      payload,
    });

    assert.equal(response.statusCode, 401);
  });

  test('with invalid signature should return 401', async () => {
    const response = await call(app, '/automa', {
      method: 'POST',
      headers: {
        'webhook-signature': 'invalid',
      },
      payload,
    });

    assert.equal(response.statusCode, 401);
  });

  suite('with valid signature', () => {
    setup(async () => {
      response = await callWithFixture('task');
    });

    test('should return 200', async () => {
      assert.equal(response.statusCode, 200);
    });

    test('should have empty body', async () => {
      assert.isEmpty(response.body);
    });

    test('should download code', async () => {
      assert.equal(downloadStub.callCount, 1);
      assert.deepEqual(downloadStub.firstCall.args, [
        {
          task: {
            id: 1,
            token: 'abcdef',
            title: 'Running bot-typescript on sample-repo',
          },
        },
        {
          baseURL: 'https://api.automa.app',
        },
      ]);
    });

    test('should propose code', async () => {
      assert.equal(proposeStub.callCount, 1);
      assert.deepEqual(proposeStub.firstCall.args, [
        {
          task: {
            id: 1,
            token: 'abcdef',
            title: 'Running bot-typescript on sample-repo',
          },
          proposal: {
            title: 'We changed your code',
          },
        },
        {
          baseURL: 'https://api.automa.app',
        },
      ]);
    });

    test('should cleanup code', async () => {
      assert.equal(cleanupStub.callCount, 1);
      assert.deepEqual(cleanupStub.firstCall.args, [
        {
          task: {
            id: 1,
            token: 'abcdef',
            title: 'Running bot-typescript on sample-repo',
          },
        },
      ]);
    });
  });

  suite('with download error', () => {
    setup(async () => {
      downloadStub.rejects(new Error('Download error'));

      response = await callWithFixture('task');
    });

    test('should return 500', async () => {
      assert.equal(response.statusCode, 500);
    });

    test('should download code', async () => {
      assert.equal(downloadStub.callCount, 1);
      assert.deepEqual(downloadStub.firstCall.args, [
        {
          task: {
            id: 1,
            token: 'abcdef',
            title: 'Running bot-typescript on sample-repo',
          },
        },
        {
          baseURL: 'https://api.automa.app',
        },
      ]);
    });

    test('should not propose code', async () => {
      assert.equal(proposeStub.callCount, 0);
    });

    test('should not cleanup code', async () => {
      assert.equal(cleanupStub.callCount, 0);
    });
  });

  suite('with propose error', () => {
    setup(async () => {
      proposeStub.rejects(new Error('Propose error'));

      response = await callWithFixture('task');
    });

    test('should return 500', async () => {
      assert.equal(response.statusCode, 500);
    });

    test('should download code', async () => {
      assert.equal(downloadStub.callCount, 1);
      assert.deepEqual(downloadStub.firstCall.args, [
        {
          task: {
            id: 1,
            token: 'abcdef',
            title: 'Running bot-typescript on sample-repo',
          },
        },
        {
          baseURL: 'https://api.automa.app',
        },
      ]);
    });

    test('should propose code', async () => {
      assert.equal(proposeStub.callCount, 1);
      assert.deepEqual(proposeStub.firstCall.args, [
        {
          task: {
            id: 1,
            token: 'abcdef',
            title: 'Running bot-typescript on sample-repo',
          },
          proposal: {
            title: 'We changed your code',
          },
        },
        {
          baseURL: 'https://api.automa.app',
        },
      ]);
    });

    test('should cleanup code', async () => {
      assert.equal(cleanupStub.callCount, 1);
      assert.deepEqual(cleanupStub.firstCall.args, [
        {
          task: {
            id: 1,
            token: 'abcdef',
            title: 'Running bot-typescript on sample-repo',
          },
        },
      ]);
    });
  });
});
