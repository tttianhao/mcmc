const assert = require('assert');
const mcmc = require('../index.js');

describe('mcmc', () => {
  it('add point?', () => {
    var node = new Operation(1,2);
    assert(node.addPoint(),3);
  });
});
