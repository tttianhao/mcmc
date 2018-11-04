'use strict';
/* eslint guard-for-in: 0 */
/* eslint no-unused-vars: 0 */
/* eslint capitalized-comments: 0 */

const jsnx = require('jsnetworkx');
const commandLineArgs = require('command-line-args');
// Var jQuery = require('jQuery');

function setDefault(options) {
  /* This function set default value if one or more args are not given by user.
  by default there are 5 nodes with coordinate (0,0), (1,1), (1,-1), (-1,1) and (-1,-1); r is 1 and t is 200 */
  // Setup the default value
  if (options.number === undefined) {
    options.number = 5;
  }
  if (options.r === undefined) {
    options.r = 1;
  }
  if (options.t === undefined) {
    options.t = 200;
  }
  if (options.coordinate === undefined) {
    options.coordinate = '0,0,1,1,-1,-1,1,-1,-1,1';
  }
  if (options.center === undefined) {
    options.center = 0;
  }
  if (options.iterate === undefined) {
    options.iterate = 1000;
  }
  return options;
}

function distance(G, node1, node2) {
  /* This function takes in the coordinate of two nodes and calculate their distance
  
  Args:
  coordinate1: (Array) the coordinate of first node
  coordinate2: (Array) the coordinate of second node

  returns:
  distance: (Number) the distance between two nodes
  */
  var cor1 = G.node.get(node1).coordinate;
  var cor2 = G.node.get(node2).coordinate;
  var dis = Math.sqrt((cor1[0] - cor2[0]) ** 2 + (cor1[1] - cor2[1]) ** 2);
  return dis;
}

function initialGraph(numberOfNodes, coordinates) {
  /* This function initialize the initial connect graph based on user input 

  Args: 
  numberOfNodes: the number of nodes by user input (Number)
  coordinates: the coordinates of the nodes (Array)

  returns:
  G: the initial connected graph that each node is connected to its previous node and next node */
  var G = new jsnx.Graph();
  for (var i = 0; i < numberOfNodes; i++) {
    G.addNode(i, { coordinate: coordinates[i] });
    if (i !== 0) {
      G.addWeightedEdgesFrom([[i, i - 1, distance(G, i, i - 1)]]);
      // Add weight to each edges so that the weight is equal to the distance between the two nodes
    }
  }
  G.addWeightedEdgesFrom([[0, numberOfNodes - 1, distance(G, 0, numberOfNodes - 1)]]);
  // G.adj.get(0).get(numberOfNodes - 1).weight = distance(
  return G;
}

function isConnected(G) {
  /* This function inspect if a Graph is connected by impelement BFS from node 0.

  Args:
  G: (object) Graph

  returns:
  boolean true if G is connected and false if G is not connected */
  // Creates a array holding all of the visited nodes
  var visited = new Array(G.nodes().length);
  for (var node = 0; node < visited.length; node++) {
    visited[node] = false;
  }
  // Creates an array holding all the nodes that is in a queue
  var queue = [0];
  while (queue[0] !== undefined) {
    // Start with node 0
    var visit;
    for (var i = 0; i < G.edges().length; i++) {
      visit = queue[0];
      // Append a node to queue if that node has not been visited and is connected to current node
      if (visit === G.edges()[i][0] && visited[visit] === false) {
        queue.push(G.edges()[i][1]);
      } else if (visit === G.edges()[i][1] && visited[visit] === false) {
        queue.push(G.edges()[i][0]);
      }
    }
    // Remove the current node from the queue
    queue.shift();
    // Mark the current node as visited
    visited[visit] = true;
  }
  if (visited.indexOf(false) === -1) {
    return true;
  }
  return false;
}

function isBridge(G, node1, node2) {
  /* This function determines if an edge is a bridge

  Args:
  G: a connected graph (object)
  node1, node2: two nodes in G

  returns:
  true if graph is disconnected after delete; false if not */
  G.removeEdge(node1, node2);
  if (!isConnected(G)) {
    G.addWeightedEdgesFrom([[node1, node2, distance(G, node1, node2)]]);
    return true;
  }
  G.addWeightedEdgesFrom([[node1, node2, distance(G, node1, node2)]]);
  return false;
}

function adjacencyMatrix(G) {
  /* Function that calculates the adjacencyMatrix of a graph

  Args:
  G: a graph (object)

  returns:
  matrix: The adjacency matrix of the input arg (array) */
  var matrix = [];
  for (var i = 0; i < G.nodes().length; i++) {
    matrix.push(new Array(G.nodes().length).fill(0));
  }
  for (var j = 0; j < G.edges().length; j++) {
    matrix[G.edges()[j][0]][G.edges()[j][1]] = G.adj
      .get(G.edges()[j][0])
      .get(G.edges()[j][1]).weight;
    matrix[G.edges()[j][1]][G.edges()[j][0]] = G.adj
      .get(G.edges()[j][0])
      .get(G.edges()[j][1]).weight;
  }
  return matrix;
}

function isEqual(matrix1, matrix2) {
  /* This function inspect if two nxn matrix are the same

  Args:
  matrix1, matrix2: two nxn matrix

  returns:
  true if they are the same; false if different */
  var equal = true;
  for (var i = 0; i < matrix1.length; i++) {
    for (var j = 0; j < matrix1.length; j++) {
      equal = equal && matrix1[i][j] === matrix2[i][j];
    }
  }
  return equal;
}

function theta(G, r, source) {
  /* This function calculates the theta parameter in relative probablity

  Args:
  G: a connected graph (object)

  returns:
  theta: theta function value (number) */
  var sum1 = 0;
  for (var i = 0; i < G.edges().length; i++) {
    sum1 += G.adj.get(G.edges()[i][0]).get(G.edges()[i][1]).weight;
  }
  var sum2 = 0;
  for (var target = 0; target < G.nodes().length; target++) {
    sum2 += jsnx.dijkstraPathLength(G, { source: source, target: target });
  }
  var theta = sum1 * r + sum2;
  return theta;
}

function piRatio(Xi, Xj, [r, T], source) {
  /* This funciton calculates Pi_j/Pi_i

  Args:
  Xi, Xj: two connected graphs (obj)
  r,T: parameters (number)
  source: node 0 (number)

  returns:
  pjpi: ratio of pi_j and pi_i (number) */
  var thetai = theta(Xi, r, source);
  var thetaj = theta(Xj, r, source);
  var pjpi = Math.exp((thetai - thetaj) / T);
  return pjpi;
}

function addOrDelete(G) {
  /* This function determines if the next propsed increment change on graph G should be add one edge
  or delete one edge. 
  There are E-B number of ways to deleting an edge; M(M-1)/2-E ways of adding an edge.
  So if adding and deleting is weighted the same. P(add) = (ways of adding)/(total ways of adding or deleting)

  Args:
  G: a connected graph (obj)

  returns:
  true if add an edge and false if delete an edge */
  var E = G.edges().length;
  var M = G.nodes().length;
  var B = 0;
  for (var i = 0; i < G.edges().length; i++) {
    if (isBridge(G, G.edges()[i][0], G.edges()[i][1])) {
      B++;
    }
  }
  var add = 0.5 * M * (M - 1) - E;
  var del = E - B;
  var handOfGod = Math.random();
  if (handOfGod < add / (add + del)) {
    return true;
  }
  return false;
}

function isEdgeBetween(G, node1, node2) {
  /* This funciton inspect if there is an edge between two nodes

  Args:
  G: a connected graph
  node1, node2: two nodes of interests

  return:
  true if an edge exist; false if doesn't */
  for (var i = 0; i < G.edges().length; i++) {
    if (node1 === G.edges()[i][0] && node2 === G.edges()[i][1]) {
      return true;
    }
    if (node2 === G.edges()[i][0] && node1 === G.edges()[i][1]) {
      return true;
    }
  }
  return false;
}

function addRandomEdge(G) {
  /* This function adds a random currently non-existing edge to a connected graph G

  Args:
  G: a connected graph (obj)

  return:
  void */
  var node1;
  var node2;
  do {
    node1 = Math.floor(Math.random() * G.nodes().length);
    node2 = Math.floor(Math.random() * G.nodes().length);
  } while (isEdgeBetween(G, node1, node2) || node1 === node2);
  G.addWeightedEdgesFrom([[node1, node2, distance(G, node1, node2)]]);
}

function deleteRandomEdge(G) {
  /* This function deletes a random non-bridge edge

  Args:
  G: a connected graph

  returns:
  void */
  var edgeIndex;
  do {
    edgeIndex = Math.floor(Math.random() * G.edges().length);
  } while (isBridge(G, G.edges()[edgeIndex][0], G.edges()[edgeIndex][1]));
  G.removeEdge(G.edges()[edgeIndex][0], G.edges()[edgeIndex][1]);
}

function proposal(Xj, Xi) {
  /* This function calculates the proposal distribution from current state Xi to proposed state Xj i.e. q(j|i)

  Args:
  Xj: proposed state, a connected graph (obj)
  Xi: current state, a connected graph (obj)

  returns:
  qdelete: when proposed state is one edge deleted from current state
  qadding: when proposed state is one edge added from current state. */
  var E = Xi.edges().length;
  var M = Xi.nodes().length;
  var B = 0;
  for (var i = 0; i < Xi.edges().length; i++) {
    if (isBridge(Xi, Xi.edges()[i][0], Xi.edges()[i][1])) {
      B++;
    }
  }
  if (Xi.edges().length > Xj.edges().length) {
    var qdelete = 1 / (E - B);
    return qdelete;
  }
  if (Xi.edges().length < Xj.edges().length) {
    var qadding = 1 / ((M * (M - 1)) / 2 - E);
    return qadding;
  }
}

function copyGraph(G, coordinates) {
  /* This function copies graph G

  Args:
  G: a graph (obj)
  coordinates: a nested array with coordinations of nodes

  returns:
  copy: a copy of G */
  var copy = new jsnx.Graph();
  for (var i = 0; i < G.nodes().length; i++) {
    copy.addNode(i, { coordinate: coordinates[i] });
  }
  for (var j = 0; j < G.edges().length; j++) {
    copy.addWeightedEdgesFrom([
      [G.edges()[j][0], G.edges()[j][1], distance(G, G.edges()[j][0], G.edges()[j][1])]
    ]);
  }
  return copy;
}

function acceptanceRatio(Xi, Xj, [r, T], source) {
  /* This function calculates the acceptance ratio of proposed state Xj, given current state Xi

  Args:
  Xj: proposed state, a connected graph (obj)
  Xi: current state, a connected graph (obj)

  returns:
  A: Acceptance ratio (number) */
  var A = (piRatio(Xi, Xj, [r, T], source) * proposal(Xi, Xj)) / proposal(Xj, Xi);
  if (A < 1) {
    return A;
  }
  return 1;
}

var expectedEdge = function(history) {
  /* This function calculates the expected number of edges
  
  Args:
  history: (class) with key to be adjaceny matrix and value to be number of time visited
  
  returns:
  expected number of total edges */
  var sum = 0;
  var edges = 0;
  for (var key in history) {
    var edge = 0;
    sum += history[key];
    var matrix = JSON.parse('[' + key + ']');
    for (var i = 0; i < matrix.length; i++) {
      if (matrix[i] !== 0) {
        edge += 1;
      }
    }
    edges += (edge / 2) * history[key];
  }
  return edges / sum;
};

var sourceEdge = function(history) {
  /* This function calculates the expeced number of edges connected to the source node
  
  Args:
  history (class) with key the adjacency matrix and value the number of time visited
  
  returns:
  expected number of edges connected with source node */
  var sum = 0;
  var edges = 0;
  for (var key in history) {
    var edge = 0;
    sum += history[key];
    var matrix = JSON.parse('[' + key + ']');
    var N = Math.sqrt(matrix.length);
    for (var i = 0; i < N; i++) {
      if (matrix[i] !== 0) {
        edge += 1;
      }
    }
    edges += edge * history[key];
  }
  return edges / sum;
};

var shortestPath = function(history, source) {
  var expected = 0;
  var total = 0;
  for (var key in history) {
    total += history[key];
    var G = new jsnx.Graph();
    var matrix = JSON.parse('[' + key + ']');
    for (var i = 0; i < Math.sqrt(matrix.length); i++) {
      for (
        var j = i * Math.sqrt(matrix.length);
        j < (i + 1) * Math.sqrt(matrix.length);
        j++
      ) {
        if (matrix[j] !== 0) {
          G.addWeightedEdgesFrom([[i, j % 4, matrix[j]]]);
        }
      }
    }
    var sum = 0;
    for (var target = 0; target < G.nodes().length; target++) {
      sum += jsnx.dijkstraPathLength(G, { source: source, target: target });
    }
    expected += sum * history[key];
  }
  return expected / total;
};

var markovChain = function(options) {
  var runtime = options.iterate;
  var inputValue = setDefault(options);
  var r = inputValue.r;
  var T = inputValue.t;
  var numberOfNodes = inputValue.number;
  var coordinates = JSON.parse('[' + inputValue.coordinate + ']');
  var corArray = new Array(numberOfNodes);
  var source = inputValue.center;
  for (var i = 0; i < numberOfNodes; i++) {
    corArray[i] = [coordinates[i * 2], coordinates[i * 2 + 1]];
  }
  var Xi = initialGraph(numberOfNodes, corArray);
  var Xj = copyGraph(Xi, corArray);
  var history = {};
  history[adjacencyMatrix(Xi)] = 1;
  var accepted = 0;
  var rejected = 0;
  for (var step = 0; step < runtime; step++) {
    // console.log(step);
    if (addOrDelete(Xi)) {
      addRandomEdge(Xj);
      if (acceptanceRatio(Xi, Xj, [r, T], source) >= Math.random()) {
        accepted++;
        Xi = copyGraph(Xj, corArray);
        if (adjacencyMatrix(Xj).toString() in history) {
          history[adjacencyMatrix(Xj).toString()]++;
        } else {
          history[adjacencyMatrix(Xj)] = 1;
        }
      } else {
        rejected++;
        Xj = copyGraph(Xi, corArray);
      }
    } else {
      deleteRandomEdge(Xj);
      if (acceptanceRatio(Xi, Xj, [r, T], source) >= Math.random()) {
        accepted++;
        Xi = copyGraph(Xj, corArray);
        if (adjacencyMatrix(Xj).toString() in history) {
          history[adjacencyMatrix(Xj).toString()]++;
        } else {
          history[adjacencyMatrix(Xj)] = 1;
        }
      } else {
        rejected++;
        Xj = copyGraph(Xi, corArray);
      }
    }
  }
  // console.log(history);
  // console.log(accepted);
  // console.log(rejected);
  var total = 0;
  var max = 0;
  var config;
  for (var key in history) {
    total += history[key];
    if (history[key] > max) {
      max = history[key];
      config = key;
    }
  }
  // console.log(total);
  // console.log(config);
  // console.log(max);
  // console.log('expected edges connected to source: ' + sourceEdge(history).toString());
  // console.log('expected number of edges: ' + expectedEdge(history).toString());
  console.log('expected shortest path is : ' + shortestPath(history, source).toString());
};
if (require.main === module) {
  /* Collects user input from command line including the number of nodes, coordinates, r and t. 
  example: node lib/index.js --number_of_nodes 5 --coordinate 0,0,1,1,-1,-1,1,-1,-1,1 --r 10 --t 300 */
  const optionDefinitions = [
    { name: 'number', alias: 'n', type: Number },
    {
      name: 'coordinate',
      alias: 'c',
      type: Array,
      defaulOption: '0,0,1,0,-1,-1,1,-1'
    },
    { name: 'r', type: Number },
    { name: 't', type: Number },
    { name: 'center', type: Number },
    { name: 'iterate', type: Number }
  ];
  const options = commandLineArgs(optionDefinitions);
  markovChain(options);
}
module.exports = {
  shortestPath,
  expectedEdge,
  sourceEdge,
  distance,
  setDefault,
  initialGraph,
  isConnected,
  isBridge,
  adjacencyMatrix,
  isEqual,
  theta,
  piRatio,
  addOrDelete,
  isEdgeBetween,
  addRandomEdge,
  deleteRandomEdge,
  proposal,
  copyGraph,
  acceptanceRatio,
  markovChain
};
