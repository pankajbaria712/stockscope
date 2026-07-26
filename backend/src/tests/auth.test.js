const test = require('node:test');
const assert = require('node:assert/strict');

const { hashPassword, comparePassword } = require('../utils/password');
const { buildSuccessResponse, buildErrorResponse } = require('../utils/response');

test('hashPassword creates a verifiable hash', async () => {
  const password = 'StrongPassword123!';
  const hashed = await hashPassword(password);

  assert.notEqual(hashed, password);
  assert.equal(await comparePassword(password, hashed), true);
  assert.equal(await comparePassword('WrongPassword', hashed), false);
});

test('response helpers build consistent payloads', () => {
  const success = buildSuccessResponse(201, 'Registered', { id: 1 });
  assert.equal(success.success, true);
  assert.equal(success.message, 'Registered');
  assert.deepEqual(success.data, { id: 1 });

  const failure = buildErrorResponse(400, 'Validation failed', [{ field: 'email', message: 'Invalid email' }]);
  assert.equal(failure.success, false);
  assert.equal(failure.message, 'Validation failed');
  assert.deepEqual(failure.errors, [{ field: 'email', message: 'Invalid email' }]);
});
