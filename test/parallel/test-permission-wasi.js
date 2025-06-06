// Flags: --permission --allow-fs-read=*
'use strict';

const common = require('../common');
const assert = require('node:assert');

const { WASI } = require('wasi');

{
  assert.throws(() => {
    new WASI({
      version: 'preview1',
      preopens: { '/': '/' },
    });
  }, common.expectsError({
    message: 'Access to this API has been restricted. Use --allow-wasi to manage permissions.',
    code: 'ERR_ACCESS_DENIED',
    permission: 'WASI',
  }));
}
