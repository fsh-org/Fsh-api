const { describe, it } = require('node:test');
const assert = require('node:assert');
const api = require('../apis/roman.js');

describe('Roman api', () => {
  it('should error on empty', async () => {
    let req = {query:{}};
    let errored = false;
    let res = {
      error: function(){errored=true}
    };
    api.execute(req,res);
    assert.strictEqual(errored, true);
  });
  it('should error on missing number', async () => {
    let req = {query:{type:'encode'}};
    let errored = false;
    let res = {
      error: function(){errored=true}
    };
    api.execute(req,res);
    assert.strictEqual(errored, true);
  });
  it('should error on missing type', async () => {
    let req = {query:{number:'10'}};
    let errored = false;
    let res = {
      error: function(){errored=true}
    };
    api.execute(req,res);
    assert.strictEqual(errored, true);
  });
  it('should error on invalid type', async () => {
    let req = {query:{type:'fjda',number:'10'}};
    let errored = false;
    let res = {
      error: function(){errored=true}
    };
    api.execute(req,res);
    assert.strictEqual(errored, true);
  });
  it('should error very big number', async () => {
    let req = {query:{type:'encode',number:'1000000000'}};
    let errored = false;
    let res = {
      error: function(){errored=true}
    };
    api.execute(req,res);
    assert.strictEqual(errored, true);
  });
  it('should encode 10 to X', async () => {
    let req = {query:{type:'encode',number:'10'}};
    let errored = false;
    let json = null;
    let res = {
      error: function(){errored=true},
      json: function(j){json=j}
    };
    api.execute(req,res);
    assert.strictEqual(errored, false);
    assert.strictEqual(json.result, 'X');
  });
  it('should decode X to 10', async () => {
    let req = {query:{type:'decode',number:'X'}};
    let errored = false;
    let json = null;
    let res = {
      error: function(){errored=true},
      json: function(j){json=j}
    };
    api.execute(req,res);
    assert.strictEqual(errored, false);
    assert.strictEqual(json.result, 10);
  });
  it('should encode 4000 to I̅V̅', async () => {
    let req = {query:{type:'encode',number:'4000'}};
    let errored = false;
    let json = null;
    let res = {
      error: function(){errored=true},
      json: function(j){json=j}
    };
    api.execute(req,res);
    assert.strictEqual(errored, false);
    assert.strictEqual(json.result, 'I̅V̅');
  });
  it('should decode I̅V̅ to 4000', async () => {
    let req = {query:{type:'decode',number:'I̅V̅'}};
    let errored = false;
    let json = null;
    let res = {
      error: function(){errored=true},
      json: function(j){json=j}
    };
    api.execute(req,res);
    assert.strictEqual(errored, false);
    assert.strictEqual(json.result, 4000);
  });
  it('should encode 100000 to ▕I̅▏', async () => {
    let req = {query:{type:'encode',number:'100000'}};
    let errored = false;
    let json = null;
    let res = {
      error: function(){errored=true},
      json: function(j){json=j}
    };
    api.execute(req,res);
    assert.strictEqual(errored, false);
    assert.strictEqual(json.result, '▕I̅▏');
  });
  it('should decode ▕I̅▏ to 100000', async () => {
    let req = {query:{type:'decode',number:'▕I̅▏'}};
    let errored = false;
    let json = null;
    let res = {
      error: function(){errored=true},
      json: function(j){json=j}
    };
    api.execute(req,res);
    assert.strictEqual(errored, false);
    assert.strictEqual(json.result, 100000);
  });
});