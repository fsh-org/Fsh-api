const { describe, it } = require('node:test');
const assert = require('node:assert');
const api = require('../apis/sha384.js');

describe('Sha384 api', () => {
  it('should error on empty', async () => {
    let req = {query:{}};
    let errored = false;
    let res = {
      error: function(){errored=true}
    };
    api.execute(req,res);
    assert.strictEqual(errored, true);
  });
  it('should encode hello to 59e1748777448...', async () => {
    let req = {query:{text:'hello'}};
    let errored = false;
    let json = null;
    let res = {
      error: function(){errored=true},
      json: function(j){json=j}
    };
    api.execute(req,res);
    assert.strictEqual(errored, false);
    assert.strictEqual(json.text, '59e1748777448c69de6b800d7a33bbfb9ff1b463e44354c3553bcdb9c666fa90125a3c79f90397bdf5f6a13de828684f');
  });
});