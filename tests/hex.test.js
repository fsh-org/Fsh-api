const { describe, it } = require('node:test');
const assert = require('node:assert');
const api = require('../apis/hex.js');

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
  it('should error on missing text', async () => {
    let req = {query:{type:'encode'}};
    let errored = false;
    let res = {
      error: function(){errored=true}
    };
    api.execute(req,res);
    assert.strictEqual(errored, true);
  });
  it('should error on missing type', async () => {
    let req = {query:{text:'hello'}};
    let errored = false;
    let res = {
      error: function(){errored=true}
    };
    api.execute(req,res);
    assert.strictEqual(errored, true);
  });
  it('should error on invalid type', async () => {
    let req = {query:{type:'fjda',text:'hello'}};
    let errored = false;
    let res = {
      error: function(){errored=true}
    };
    api.execute(req,res);
    assert.strictEqual(errored, true);
  });
  it('should encode hello to 68656c6c6f', async () => {
    let req = {query:{type:'encode',text:'hello'}};
    let errored = false;
    let json = null;
    let res = {
      error: function(){errored=true},
      json: function(j){json=j}
    };
    api.execute(req,res);
    assert.strictEqual(errored, false);
    assert.strictEqual(json.text, '68656c6c6f');
  });
  it('should decode 68656c6c6f to hello', async () => {
    let req = {query:{type:'decode',text:'68656c6c6f'}};
    let errored = false;
    let json = null;
    let res = {
      error: function(){errored=true},
      json: function(j){json=j}
    };
    api.execute(req,res);
    assert.strictEqual(errored, false);
    assert.strictEqual(json.text, 'hello');
  });
});