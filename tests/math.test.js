const { describe, it } = require('node:test');
const assert = require('node:assert');
const api = require('../apis/math.js');

describe('Math api', () => {
  it('should send invalid expression on no query', async () => {
    let req = {url:'https://api.fsh.plus/math'};
    let errored = false;
    let json = null;
    let res = {
      error: ()=>{errored=true},
      json: (j)=>{json=j}
    };
    api.execute(req,res);
    assert.strictEqual(errored, false);
    assert.strictEqual(json.result, 'invalid expression');
  });
  it('should send invalid expression on empty query', async () => {
    let req = {url:'https://api.fsh.plus/math?line='};
    let errored = false;
    let json = null;
    let res = {
      error: ()=>{errored=true},
      json: (j)=>{json=j}
    };
    api.execute(req,res);
    assert.strictEqual(errored, false);
    assert.strictEqual(json.result, 'invalid expression');
  });
  it('basic sum', async () => {
    let req = {url:'https://api.fsh.plus/math?line=5+5'};
    let errored = false;
    let json = null;
    let res = {
      error: ()=>{errored=true},
      json: (j)=>{json=j}
    };
    api.execute(req,res);
    assert.strictEqual(errored, false);
    assert.strictEqual(json.result, '10');
  });
  it('handles negatives', async () => {
    let req = {url:'https://api.fsh.plus/math?line=3-5'};
    let errored = false;
    let json = null;
    let res = {
      error: ()=>{errored=true},
      json: (j)=>{json=j}
    };
    api.execute(req,res);
    assert.strictEqual(errored, false);
    assert.strictEqual(json.result, '-2');
  });
  it('handles decimals', async () => {
    let req = {url:'https://api.fsh.plus/math?line=5/2'};
    let errored = false;
    let json = null;
    let res = {
      error: ()=>{errored=true},
      json: (j)=>{json=j}
    };
    api.execute(req,res);
    assert.strictEqual(errored, false);
    assert.strictEqual(json.result, '2.5');
  });
  it('handles pemdas', async () => {
    let req = {url:'https://api.fsh.plus/math?line=(1+(1+42)**0.5)*4-1'};
    let errored = false;
    let json = null;
    let res = {
      error: ()=>{errored=true},
      json: (j)=>{json=j}
    };
    api.execute(req,res);
    assert.strictEqual(errored, false);
    assert.strictEqual(json.result, '29.229754097208');
  });
  it('handles very large numbers by returning infinites', async () => {
    let req = {url:'https://api.fsh.plus/math?line=999^999'};
    let errored = false;
    let json = null;
    let res = {
      error: ()=>{errored=true},
      json: (j)=>{json=j}
    };
    api.execute(req,res);
    assert.strictEqual(errored, false);
    assert.strictEqual(json.result, 'Infinity');
  });
  it('handles negative 0', async () => {
    let req = {url:'https://api.fsh.plus/math?line=1/-0'};
    let errored = false;
    let json = null;
    let res = {
      error: ()=>{errored=true},
      json: (j)=>{json=j}
    };
    api.execute(req,res);
    assert.strictEqual(errored, false);
    assert.strictEqual(json.result, '-Infinity');
  });
});
