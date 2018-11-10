'use strict';
/* eslint guard-for-in: 0 */
/* eslint no-unused-vars: 0 */
/* eslint capitalized-comments: 0 */
/* eslint max-params:0 */
/* eslint no-negated-condition:0 */

const jsnx = require('jsnetworkx');
const commandLineArgs = require('command-line-args');

function setDefault(options) {
  /* This function set default value if one or more args are not given by user.
  by default there are 5 nodes with coordinate (0,0), (1,1), (1,-1), (-1,1) and (-1,-1); r is 1 and t is 200 */
  if (options.number === undefined) {
    options.number = 4;
  }
  if (options.r === undefined) {
    options.r = 1;
  }
  if (options.t === undefined) {
    options.t = 1;
  }
  if (options.coordinate === undefined) {
    options.coordinate = '0,0,1,1,1,-1,-1,1';
  }
  if (options.iterate === undefined) {
    options.iterate = 2000;
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
    var visit = G.neighbors(queue[0]);
    for (var i = 0; i < visit.length; i++) {
      if (visited[queue[0]] === false) {
        queue.push(visit[i]);
      }
    }
    // Mark the current node as visited
    visited[queue[0]] = true;
    // Remove the current node from the queue
    queue.shift();
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
  /* This function inspect if two nx2 matrix are the same

  Args:
  matrix1, matrix2: two nxn matrix

  returns:
  true if they are the same; false if different */
  var equal = true;
  if (matrix1.length !== matrix2.length) {
    return false;
  }
  for (var i = 0; i < matrix1.length; i++) {
    for (var j = 0; j < 2; j++) {
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

function piRatio(Xi, Xj, r, T, source) {
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

function addRandomEdge(G) {
  /* This function adds a random currently non-existing edge to a connected graph G

  Args:
  G: a connected graph (obj) */
  var node1;
  var node2;
  do {
    node1 = Math.floor(Math.random() * G.nodes().length);
    node2 = Math.floor(Math.random() * G.nodes().length);
  } while (G.neighbors(node1).includes(node2) || node1 === node2);
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

function acceptReject(Xi, Xj, r, T, source) {
  /* This function calculates the proposed state if accepted or rejected

  Args:
  Xj: proposed state, a connected graph (obj)
  Xi: current state, a connected graph (obj)

  returns:
  Xj: if the proposed state is accpted
  Xi: if the proposed stete is rejected */
  var A = (piRatio(Xi, Xj, r, T, source) * proposal(Xi, Xj)) / proposal(Xj, Xi);
  var R = Math.random();
  if (Math.min(A, 1) > R) {
    return Xj;
  }
  return Xi;
}

function logHistory(Xi, history) {
  /* This function record the edges of current state Xi to the list of states mcmc has been visited

  Args:
  Xi: current state (obj)
  history: list of states mcmc has been explored (map)
  */
  var contain = true;
  history.forEach((value, key, map) => {
    if (isEqual(key, Xi.edges())) {
      map.set(key, ++value); // if mcmc has already been to this state, the frequency +1
      contain = false;
    }
  });
  if (contain) {
    history.set(Xi.edges(), 1); // if mcmc has never been to this state, set frequency to be 1
  }
}

function markovChain(options) {
  /* This function is the implementation of metroplis hasting algorithm.
  
  Args:
  options: (Obj) user input including r, t, number of nodes, coordiantaion and iterate times

  returns:
  history: (Map) a list of states where mcmc has been explored. Keys are the edges of the state and values are the frequency
  */
  var edges = (options.number * (options.number - 1)) / 2;
  var coor = options.coordinate;
  var Xi = initialGraph(options.number, coor); // Set the initial graph
  var history = new Map();
  history.set(Xi.edges(), 1); // Set the inital mcmc state
  var step = 0;
  while (step < options.iterate) {
    console.log('iteration: ' + (1 + step).toString());
    var Xj = copyGraph(Xi, coor);
    var center = Math.floor(Math.random() * options.number); // random generate a source node
    if (Math.random() > 0.5 && Xi.edges().length < edges) {
      // 50% of the times proposal state is one edge added and current state can not be a complete graph
      step++;
      addRandomEdge(Xj);
      Xi = copyGraph(acceptReject(Xi, Xj, options.r, options.t, center), coor);
      logHistory(Xi, history); // record the current state in history states
    } else if (Xi.edges().length > options.number - 1) {
      // 50% of the times proposal state is one edge removed and current state needs to have at least one non-bridge edge
      step++;
      deleteRandomEdge(Xj);
      Xi = copyGraph(acceptReject(Xi, Xj, options.r, options.t, center), coor);
      logHistory(Xi, history);
    }
  }
  return history;
}

function expectedEdge(history) {
  /* This function calculates the expected number of edges, expected number of edges connected to node 0
  and the total number of states visited by the mcmc chian

  Args:
  history: (May) key: each state, value: frequency

  returns:
  edges / sum: expected number of edges
  sourceEdge / sum: expected number of edges connected to node 0
  total: total number of visisted states
  */
  var sum = 0;
  var edges = 0;
  var sourceEdges = 0;
  var total = 0;
  history.forEach((value, key) => {
    total++;
    sum += value;
    edges += key.length * value;
    var sourceEdge = 0;
    for (let i = 0; i < key.length; i++) {
      if (key[i].includes(0)) {
        sourceEdge++;
      }
    }
    sourceEdges += sourceEdge * value;
  });
  return [edges / sum, sourceEdges / sum, total];
}

function toGraph(edges, coordinate) {
  /* This function convert edges information to a jsnx graph

  Args:
  edges: (Array) the edges Graph contains
  coordinate: the coordinate of the nodes

  returns:
  G: (Object) a graph constructed with the given edge and coordination
  */
  var G = new jsnx.Graph();
  for (let i = 0; i < edges.length; i++) {
    var coor1 = coordinate[edges[i][0]];
    var coor2 = coordinate[edges[i][1]];
    var distance = Math.sqrt((coor1[0] - coor2[0]) ** 2 + (coor1[1] - coor2[1]) ** 2);
    G.addWeightedEdgesFrom([[edges[i][0], edges[i][1], distance]]);
  }
  return G;
}

function shortPath(history, coordinate) {
  /* This function calculates the maximum sum of length from another node to node 0
  
  Args:
  history: (Map) key is the edges of the states and value is the frequency
  coordinate: The coordinate of the nodes (Array)

  returns:
  total: sum of the path length from node 0 to another node.
  */
  var total = 0;
  history.forEach((value, key) => {
    var sum = 0;
    var G = toGraph(key, coordinate);
    for (let i = 1; i < G.nodes().length; i++) {
      sum += jsnx.dijkstraPathLength(G, { source: 0, target: i });
    }
    total += sum * value;
  });
  return total;
}

function convert(coordinate) {
  /* This function convert the input coordinate as a string to array
  
  Args: 
  coordinate: (String) input from command line in format x1, y1, x2, y2, x3, y3 ...
  
  returns:
  coor: A nested array contains the coordination of the nodes */
  var coordinateArr = JSON.parse('[' + coordinate + ']');
  var coor = [];
  for (let i = 0; i < coordinateArr.length / 2; i++) {
    coor.push([coordinateArr[2 * i], coordinateArr[2 * i + 1]]);
  }
  return coor;
}

function topGraph(history, total, coordinate) {
  /* This function print out the adjacency matrix of the top 1% most probable graph
  
  Args:
  history: Map with key the edges of graphs and value the frequency
  total: the total states mcmc has been explored
  coordinate: the coordination of node (Array) */
  const mapSort = new Map([...history.entries()].sort((a, b) => b[1] - a[1]));
  let i = 0;
  mapSort.forEach((value, key) => {
    i++;
    if (i <= Math.floor(total * 0.01) + 1) {
      var G = toGraph(key, coordinate);
      var matrix = adjacencyMatrix(G);
      for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[i].length; j++) {
          matrix[i][j] = matrix[i][j].toFixed(3); // format the numbers to 3 decimal places
        }
      }
      console.log('The adjacency matrix of top 1% most probable graph: ');
      for (let k = 0; k < matrix.length; k++) {
        console.log(...matrix[k]);
      }
    }
  });
}

/* istanbul ignore if */
if (require.main === module) {
  /* Entry point for JavaScript 
  example: node lib/index.js --number 4 --coordinate 0,0,1,1,-1,1,1,-1 --r 1 --t 1 --iterate 1000 */
  const optionDefinitions = [
    { name: 'number', alias: 'n', type: Number },
    {
      name: 'coordinate',
      alias: 'c',
      type: Array
    },
    { name: 'r', type: Number },
    { name: 't', type: Number },
    { name: 'iterate', type: Number }
  ];
  var options = commandLineArgs(optionDefinitions);
  options = setDefault(options);
  options.coordinate = convert(options.coordinate);
  if (options.coordinate.length !== options.number) {
    console.log(
      'Your input number of node does not match with the number of coordinations'
    );
  } else if (options.t <= 0) {
    console.log('T must be positive');
  } else {
    var history = markovChain(options);
    var expected = expectedEdge(history);
    console.log('The expected number of total edge is: ' + expected[0].toString());
    console.log(
      'The expected number of edges connected to node 0 is: ' + expected[1].toString()
    );
    console.log(
      'The expected maximum sum of shortest path from another node to node 0 is ' +
        (shortPath(history, options.coordinate) / (options.iterate + 1)).toString()
    );
    console.log('mcmc has explored ' + expected[2] + ' states');
    topGraph(history, expected[2], options.coordinate);
  }
}
module.exports = {
  distance,
  setDefault,
  initialGraph,
  isConnected,
  isBridge,
  adjacencyMatrix,
  isEqual,
  theta,
  piRatio,
  addRandomEdge,
  deleteRandomEdge,
  proposal,
  copyGraph,
  acceptReject,
  logHistory,
  toGraph,
  shortPath,
  markovChain,
  convert,
  expectedEdge,
  topGraph
};
