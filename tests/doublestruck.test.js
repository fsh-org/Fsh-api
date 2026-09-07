const { describe, it } = require('node:test');
const assert = require('node:assert');
const api = require('../apis/doublestruck.js');

describe('Doblestruck api', () => {
  it('should error on empty', async () => {
    let req = {query:{}};
    let errored = false;
    let res = {
      error: ()=>{errored=true}
    };
    api.execute(req,res);
    assert.strictEqual(errored, true);
  });
  it('should transform hello21 to hElLo', async () => {
    let req = {query:{text:'hello21'}};
    let errored = false;
    let json = null;
    let res = {
      error: ()=>{errored=true},
      json: (j)=>{json=j}
    };
    api.execute(req,res);
    assert.strictEqual(errored, false);
    assert.strictEqual(json.text, '𝕙𝕖𝕝𝕝𝕠𝟚𝟙');
  });
});