const { describe, it } = require('node:test');
const assert = require('node:assert');
const api = require('../apis/sha1.js');

describe('Sha1 api', () => {
  it('should error on empty', async () => {
    let req = {query:{}};
    let errored = false;
    let res = {
      error: function(){errored=true}
    };
    api.execute(req,res);
    assert.strictEqual(errored, true);
  });
  it('should encode hello to aaf4c61ddcc5e...', async () => {
    let req = {query:{text:'hello'}};
    let errored = false;
    let json = null;
    let res = {
      error: function(){errored=true},
      json: function(j){json=j}
    };
    api.execute(req,res);
    assert.strictEqual(errored, false);
    assert.strictEqual(json.text, 'aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d');
  });
});