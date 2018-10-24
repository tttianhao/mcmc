const assert = require('assert');
const jsnx = require('jsnetworkx');
const mcmc = require('../index.js');

describe('mcmc', () => {
  it('Find distance?', () => {
    var node1 = [0, 0];
    var node2 = [1, 0];
    var distance = mcmc.distance(node1, node2);
    assert.equal(distance, 1);
  });

  it('Should be disconnected?', () => {
    var G = new jsnx.Graph();
    G.addNodesFrom([0, 1, 2, 3, 4]);
    console.log(G.nodes());
    G.addEdge(0, 1);
    G.addEdge(1, 2);
    G.addEdge(2, 3);
    assert(!mcmc.isConnected(G));
  });
});
