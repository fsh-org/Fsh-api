const { describe, it } = require('node:test');
const assert = require('node:assert');
const api = require('../apis/sha256.js');

describe('Hex api', () => {
  it('should error on empty', async () => {
    let req = {query:{}};
    let errored = false;
    let res = {
      error: function(){errored=true}
    };
    api.execute(req,res);
    assert.strictEqual(errored, true);
  });
  it('should encode hello to 2cf24dba5fb0a...', async () => {
    let req = {query:{text:'hello'}};
    let errored = false;
    let json = null;
    let res = {
      error: function(){errored=true},
      json: function(j){json=j}
    };
    api.execute(req,res);
    assert.strictEqual(errored, false);
    assert.strictEqual(json.text, '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824');
  });
});