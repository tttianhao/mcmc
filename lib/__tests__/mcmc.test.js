const assert = require('assert');
const mcmc = require('../index.js');

describe('mcmc', () => {
  it('add point?', () => {
    var node = new mcmc.Operation(1, 2);
    assert.equal(node.addPoints(), 3);
  });
});
