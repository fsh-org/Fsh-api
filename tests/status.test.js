const { describe, it } = require('node:test');
const assert = require('node:assert');
const api = require('../apis/status.js');

describe('Status api', () => {
  it('should error on empty', async () => {
    let req = {query:{}};
    let errored = false;
    let res = {
      error: function(){errored=true}
    };
    api.execute(req,res);
    assert.strictEqual(errored, true);
  });
  it('should respond with 200 on 200 query', async () => {
    let req = {query:{status:'200'}};
    let errored = false;
    let status = null;
    let json = null;
    let res = {
      error: function(){errored=true},
      status: function(s){status=s},
      json: function(j){json=j}
    };
    api.execute(req,res);
    assert.strictEqual(errored, false);
    assert.strictEqual(status, 200);
    assert.strictEqual(json.status, 200);
  });
  it('should respond with 400 on 400 query', async () => {
    let req = {query:{status:'400'}};
    let errored = false;
    let status = null;
    let json = null;
    let res = {
      error: function(){errored=true},
      status: function(s){status=s},
      json: function(j){json=j}
    };
    api.execute(req,res);
    assert.strictEqual(errored, false);
    assert.strictEqual(status, 400);
    assert.strictEqual(json.status, 400);
  });
});
