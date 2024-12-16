const { describe, it } = require('node:test');
const assert = require('node:assert');
const api = require('../apis/reverse.js');

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
  it('should transform hello to olleh', async () => {
    let req = {query:{type:'encode',text:'hello'}};
    let errored = false;
    let json = null;
    let res = {
      error: function(){errored=true},
      json: function(j){json=j}
    };
    api.execute(req,res);
    assert.strictEqual(errored, false);
    assert.strictEqual(json.text, 'olleh');
  });
});