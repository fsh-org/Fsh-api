const { describe, it } = require('node:test');
const assert = require('node:assert');
const api = require('../apis/reverse.js');

describe('Reverse api', () => {
  it('should error on empty', async () => {
    let req = {query:{}};
    let errored = false;
    let res = {
      error: ()=>{errored=true}
    };
    api.execute(req,res);
    assert.strictEqual(errored, true);
  });
  it('should keep e to e', async () => {
    let req = {query:{text:'e'}};
    let errored = false;
    let json = null;
    let res = {
      error: ()=>{errored=true},
      json: (j)=>{json=j}
    };
    api.execute(req,res);
    assert.strictEqual(errored, false);
    assert.strictEqual(json.text, 'e');
  });
  it('should transform hello to olleh', async () => {
    let req = {query:{text:'hello'}};
    let errored = false;
    let json = null;
    let res = {
      error: ()=>{errored=true},
      json: (j)=>{json=j}
    };
    api.execute(req,res);
    assert.strictEqual(errored, false);
    assert.strictEqual(json.text, 'olleh');
  });
  it('handles tildes', async () => {
    let req = {query:{text:'he\u0301y'}};
    let errored = false;
    let json = null;
    let res = {
      error: ()=>{errored=true},
      json: (j)=>{json=j}
    };
    api.execute(req,res);
    assert.strictEqual(errored, false);
    assert.strictEqual(json.text, 'ye\u0301h');
  });
  it('handles emojis', async () => {
    let req = {query:{text:'aww 👩‍❤️‍👨'}};
    let errored = false;
    let json = null;
    let res = {
      error: ()=>{errored=true},
      json: (j)=>{json=j}
    };
    api.execute(req,res);
    assert.strictEqual(errored, false);
    assert.strictEqual(json.text, '👩‍❤️‍👨 wwa');
  });
});