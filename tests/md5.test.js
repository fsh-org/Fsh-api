const { describe, it } = require('node:test');
const assert = require('node:assert');
const api = require('../apis/md5.js');

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
  it('should encode hello to 5d41402abc4b2...', async () => {
    let req = {query:{text:'hello'}};
    let errored = false;
    let json = null;
    let res = {
      error: function(){errored=true},
      json: function(j){json=j}
    };
    api.execute(req,res);
    assert.strictEqual(errored, false);
    assert.strictEqual(json.text, '5d41402abc4b2a76b9719d911017c592');
  });
});