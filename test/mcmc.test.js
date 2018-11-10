/* eslint-env mocha */
/* eslint capitalized-comments: 0 */
/* eslint guard-for-in:0 */

const assert = require('assert');
const jsnx = require('jsnetworkx');
const mcmc = require('../lib/index.js');

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
    G.addWeightedEdgesFrom([[0, 1, 2], [1, 2, 1], [0, 3, 3], [3, 4, 5], [0, 2, 1]]);
    var matrix = mcmc.adjacencyMatrix(G);
    var expected = [
      [0, 2, 1, 3, 0],
      [2, 0, 1, 0, 0],
      [1, 1, 0, 0, 0],
      [3, 0, 0, 0, 5],
      [0, 0, 0, 5, 0]
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
    var m1 = [[1, 2], [3, 4], [5, 6]];
    var m2 = [[1, 2], [3, 4], [5, 6]];
    assert(mcmc.isEqual(m1, m2));
    m2[1][1] = 100;
    assert(!mcmc.isEqual(m1, m2));
    var G1 = mcmc.initialGraph(3, [[0, 0], [1, 1], [0, 1]]);
    var G2 = mcmc.initialGraph(3, [[0, 0], [1, 1], [0, 1]]);
    assert(mcmc.isEqual(G1.edges(), G2.edges()));
  });

  it('set default correct?', () => {
    var inputValue = mcmc.setDefault({});
    assert.equal(inputValue.r, 1);
    assert.equal(inputValue.t, 1);
    assert.equal(inputValue.number, 4);
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

  it('log history?', () => {
    var Xi = mcmc.initialGraph(3, [[0, 0], [1, 1], [1, 0]]);
    var history = new Map();
    history.set([1, 2], 2);
    mcmc.logHistory(Xi, history);
    history.forEach((value, key) => {
      if (mcmc.isEqual(key, Xi.edges())) {
        assert.equal(value, 1);
      }
    });
    mcmc.logHistory(Xi, history);
    history.forEach((value, key) => {
      if (mcmc.isEqual(key, Xi.edges())) {
        assert.equal(value, 2);
      }
    });
  });

  it('does it adds a random edge?', () => {
    var G = mcmc.initialGraph(4, [[0, 0], [1, 0], [1, 1], [0, 1]]);
    mcmc.addRandomEdge(G);
    assert.equal(G.edges().length, 5);
    mcmc.addRandomEdge(G);
    assert.equal(G.edges().length, 6);
    assert(G.neighbors(1).includes(3));
    assert(G.neighbors(0).includes(2));
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
      mcmc.piRatio(G, G1, 10, 300, 0),
      Math.exp((2 - 11 * Math.sqrt(2)) / 300)
    );
    assert.equal(
      mcmc.piRatio(G1, G, 10, 300, 0),
      Math.exp((11 * Math.sqrt(2) - 2) / 300)
    );
  });

  it('does it computes whether accept or reject correctly?', () => {
    var G = mcmc.initialGraph(4, [[0, 0], [1, 0], [1, 1], [0, 1]]);
    var G1 = mcmc.initialGraph(4, [[0, 0], [1, 0], [1, 1], [0, 1]]);
    G1.addWeightedEdgesFrom([[0, 2, Math.sqrt(2)]]);
    G1 = mcmc.copyGraph(mcmc.acceptReject(G1, G, 10, 300, 0), [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1]
    ]);
    assert(mcmc.isEqual(G1.edges(), G.edges()));
  });

  it('convert edges to graph?', () => {
    var edges = [[0, 1], [0, 2], [0, 3]];
    var coordinate = [[0, 0], [0, 1], [1, 1], [0, 1]];
    var G = mcmc.toGraph(edges, coordinate);
    assert.equal(G.edges().length, 3);
    assert.equal(G.nodes().length, 4);
    assert.equal(G.adj.get(0).get(1).weight, 1);
  });

  // markovChain, expectetEdge, shorPath, convert, topGraph
});
