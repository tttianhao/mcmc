const assert = require('assert');
const jsnx = require('jsnetworkx');
const mcmc = require('../index.js');

describe('mcmc', () => {
  it('Find distance?', () => {
    var G = new jsnx.Graph();
    G.addNode(0, { coordinate: [1, 1] });
    G.addNode(1, { coordinate: [-1, 1] });
    var dis = mcmc.distance(G, 1, 0);
    assert.equal(2, dis);
  });

  it('Compute the ajacency matrix?', () => {
    var G = new jsnx.Graph();
    G.addNodesFrom([0, 1, 2, 3, 4]);
    G.addEdgesFrom([[0, 1], [1, 2], [0, 3], [3, 4], [0, 2]]);
    var matrix = mcmc.adjacencyMatrix(G);
    var expected = [
      [0, 1, 1, 1, 0],
      [1, 0, 1, 0, 0],
      [1, 1, 0, 0, 0],
      [1, 0, 0, 0, 1],
      [0, 0, 0, 1, 0]
    ];
    for (var i = 0; i < G.nodes().length; i++) {
      for (var j = 0; j < G.nodes().length; j++) {
        assert.equal(matrix[i][j], expected[i][j]);
      }
    }
  });

  it('Should be connected?', () => {
    var Gdis = new jsnx.Graph();
    Gdis.addNodesFrom([0, 1, 2, 3, 4]);
    Gdis.addEdgesFrom([[1, 2], [0, 1], [2, 4]]);
    assert(!mcmc.isConnected(Gdis));
    var Gcon = new jsnx.Graph();
    Gcon.addNodesFrom([0, 1, 2, 3, 4, 5]);
    Gcon.addEdgesFrom([[0, 1], [0, 2], [2, 3], [2, 5], [0, 3], [4, 5]]);
    assert(mcmc.isConnected(Gcon));
    var G = new jsnx.Graph();
    G.addNodesFrom([0, 1, 2, 3, 4, 5]);
    G.addEdgesFrom([[0, 1], [2, 3], [2, 5], [0, 3], [4, 5]]);
    assert(mcmc.isConnected(G));
  });

  it('should be equal?', () => {
    var m1 = [[1, 2, 3], [3, 4, 5], [5, 6, 7]];
    var m2 = [[1, 2, 3], [3, 4, 5], [5, 6, 7]];
    assert(mcmc.isEqual(m1, m2));
    m2[1][2] = 100;
    assert(!mcmc.isEqual(m1, m2));
  });

  it('set default correct?', () => {
    var inputValue = mcmc.setDefault({});
    assert.equal(inputValue.r, 1);
    assert.equal(inputValue.t, 200);
    assert.equal(inputValue.number, 5);
  });

  it('Is it a bridge?', () => {
    var G = new jsnx.Graph();
    G.addNodesFrom([0, 1, 2, 3, 4, 5], { coordinate: [1, 2] });
    G.addWeightedEdgesFrom([
      [0, 1, 1],
      [0, 2, 2],
      [2, 3, 2],
      [2, 5, 1],
      [0, 3, 2],
      [4, 5, 6]
    ]);
    assert(mcmc.isBridge(G, 0, 1));
    assert(!mcmc.isBridge(G, 0, 2));
    assert(!mcmc.isBridge(G, 2, 3));
    assert(mcmc.isBridge(G, 2, 5));
  });
});
