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
    assert(mcmc.isBridge(G, 1, 0));
    assert(!mcmc.isBridge(G, 2, 0));
  });

  it('Does it choose add or delete properly?', () => {
    var G = new jsnx.Graph();
    G.addNodesFrom([0, 1, 2, 3], { coordinate: [1, 2] });
    G.addWeightedEdgesFrom([[0, 1, 1], [0, 2, 2], [0, 3, 3]]);
    for (var i = 0; i < 1000; i++) {
      assert(mcmc.addOrDelete(G));
    }
    var Gfull = new jsnx.Graph();
    G.addNodesFrom([0, 1, 2], { coordinate: [1, 0] });
    G.addWeightedEdgesFrom([[0, 1, 1], [0, 2, 2], [1, 2, 3]]);
    for (var j = 0; j < 1000; j++) {
      assert(!mcmc.addOrDelete(Gfull));
    }
  });

  it('Does it creates an initial graph?', () => {
    var G = mcmc.initialGraph(3, [[0, 0], [1, 1], [0, 1]]);
    assert.equal(G.nodes().length, 3);
    assert.equal(G.edges().length, 3);
  });

  it('Theta is correctly calculated?', () => {
    var G = mcmc.initialGraph(4, [[0, 0], [1, 0], [1, 1], [0, 1]]);
    var theta = mcmc.theta(G, 10, 0);
    assert.equal(theta, 44);
  });

  it('does it finds edge between two nodes?', () => {
    var G = mcmc.initialGraph(4, [[0, 0], [1, 0], [1, 1], [0, 1]]);
    assert(mcmc.isEdgeBetween(G, 0, 1));
    assert(mcmc.isEdgeBetween(G, 2, 1));
    assert(!mcmc.isEdgeBetween(G, 1, 3));
  });

  it('does it adds a random edge?', () => {
    var G = mcmc.initialGraph(4, [[0, 0], [1, 0], [1, 1], [0, 1]]);
    mcmc.addRandomEdge(G);
    assert.equal(G.edges().length, 5);
    mcmc.addRandomEdge(G);
    assert.equal(G.edges().length, 6);
    assert(mcmc.isEdgeBetween(G, 1, 3));
    assert(mcmc.isEdgeBetween(G, 0, 2));
  });

  it('does it delete a random edges?', () => {
    var G = mcmc.initialGraph(4, [[0, 0], [1, 0], [1, 1], [0, 1]]);
    mcmc.deleteRandomEdge(G);
    assert.equal(G.edges().length, 3);
  });

  it('does it calculate proposal distribution correctly?', () => {
    var G = mcmc.initialGraph(4, [[0, 0], [1, 0], [1, 1], [0, 1]]);
    var G1 = mcmc.initialGraph(4, [[0, 0], [1, 0], [1, 1], [0, 1]]);
    mcmc.deleteRandomEdge(G1);
    assert.equal(mcmc.proposal(G, G1), 1 / 3);
    assert.equal(mcmc.proposal(G1, G), 0.25);
    var A = mcmc.initialGraph(4, [[0, 0], [1, 0], [1, 1], [0, 1]]);
    var A1 = mcmc.initialGraph(4, [[0, 0], [1, 0], [1, 1], [0, 1]]);
    mcmc.addRandomEdge(A1);
    assert.equal(mcmc.proposal(A1, A), 0.5);
    assert.equal(mcmc.proposal(A, A1), 0.2);
  });

  it('does it copy the graph exactly?', () => {
    var G = mcmc.initialGraph(4, [[0, 0], [1, 0], [1, 1], [0, 1]]);
    var G1 = mcmc.copyGraph(G, [[0, 0], [1, 0], [1, 1], [0, 1]]);
    assert.equal(G.edges().length, G1.edges().length);
    assert.equal(G.nodes().length, G1.nodes().length);
    assert(mcmc.isEqual(G.edges(), G1.edges()));
  });

  it('does it computes pi_j/pi_i correctly?', () => {
    var G = mcmc.initialGraph(4, [[0, 0], [1, 0], [1, 1], [0, 1]]);
    var G1 = mcmc.initialGraph(4, [[0, 0], [1, 0], [1, 1], [0, 1]]);
    G1.addWeightedEdgesFrom([[0, 2, Math.sqrt(2)]]);
    assert.equal(
      mcmc.piRatio(G, G1, [10, 300], 0),
      Math.exp((2 - 11 * Math.sqrt(2)) / 300)
    );
    assert.equal(
      mcmc.piRatio(G1, G, [10, 300], 0),
      Math.exp((11 * Math.sqrt(2) - 2) / 300)
    );
  });

  it('does it computes acceptance ratio correctly?', () => {
    var G = mcmc.initialGraph(4, [[0, 0], [1, 0], [1, 1], [0, 1]]);
    var G1 = mcmc.initialGraph(4, [[0, 0], [1, 0], [1, 1], [0, 1]]);
    G1.addWeightedEdgesFrom([[0, 2, Math.sqrt(2)]]);
    assert.equal(
      mcmc.acceptanceRatio(G, G1, [10, 300], 0),
      (Math.exp((2 - 11 * Math.sqrt(2)) / 300) * 0.2) / 0.5
    );
    assert.equal(mcmc.acceptanceRatio(G1, G, [10, 300], 0), 1);
  });

  it('does main function works?', () => {
    mcmc.markovChain({}, 10);
  });
});
