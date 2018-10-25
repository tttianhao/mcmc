'use strict';
var jsnx = require('jsnetworkx');
const commandLineArgs = require('command-line-args');

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
    matrix[G.edges()[j][0]][G.edges()[j][1]] = 1;
    matrix[G.edges()[j][1]][G.edges()[j][0]] = 1;
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

var main = function(options) {
  var inputValue = setDefault(options);
  var r = inputValue.r;
  var T = inputValue.t;
  var numberOfNodes = inputValue.number;
  var coordinates = JSON.parse('[' + inputValue.coordinate + ']');
  var corArray = new Array(numberOfNodes);
  for (var i = 0; i < numberOfNodes; i++) {
    corArray[i] = [coordinates[i * 2], coordinates[i * 2 + 1]];
  }
  var G = initialGraph(numberOfNodes, corArray);
  console.log(r);
  console.log(T);
  console.log(corArray);
  var matrix = adjacencyMatrix(G);
  console.log(matrix);
  console.log(theta(G, r, 1));
  console.log(piRatio(G, G, [r, T], 0));
};

if (require.main === module) {
  /* Collects user input from command line including the number of nodes, coordinates, r and t. 
  example: node lib/index.js --number_of_nodes 5 --coordinate 0,0,1,1,-1,-1,1,-1,-1,1 --r 10 --t 300 */
  const optionDefinitions = [
    { name: 'number', alias: 'n', type: Number },
    {
      name: 'coordinate',
      alias: 'c',
      type: Array
    },
    { name: 'r', type: Number },
    { name: 't', type: Number }
  ];
  const options = commandLineArgs(optionDefinitions);
  console.log(typeof options);
  main(options);
}
module.exports = {
  distance,
  setDefault,
  initialGraph,
  isConnected,
  isBridge,
  adjacencyMatrix,
  isEqual
};
