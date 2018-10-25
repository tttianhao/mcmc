'use strict';
var jsnx = require('jsnetworkx');
const commandLineArgs = require('command-line-args');

function input() {
  /* This function is input function and save as an object. 
  It collects user input from command line including the number of nodes, coordinates, r and t. 
  example: node lib/index.js --number_of_nodes 5 --coordinate 0,0,1,1,-1,-1,1,-1,-1,1 --r 10 --t 300
  by default there are 5 nodes with coordinate (0,0), (1,1), (1,-1), (-1,1) and (-1,-1); r is 1 and t is 200 */
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
  // Print out user's input
  var coordinates = JSON.parse('[' + options.coordinate + ']');
  console.log('Number of nodes: ' + options.number);
  for (var i = 0; i < coordinates.length / 2; i++) {
    console.log(
      'Coordinate of node number ' +
        i +
        ' is ' +
        '(' +
        coordinates[i * 2].toString() +
        ',' +
        coordinates[i * 2 + 1].toString() +
        ')'
    );
  }
  console.log('r is ' + options.r);
  console.log('T is ' + options.t);
  return options;
}

function distance(coordinate1, coordinate2) {
  /* This function takes in the coordinate of two nodes and calculate their distance
  
  Args:
  coordinate1: (Array) the coordinate of first node
  coordinate2: (Array) the coordinate of second node

  returns:
  distance: (Number) the distance between two nodes
  */
  var distance = Math.sqrt(
    (coordinate1[0] - coordinate2[0]) ** 2 + (coordinate1[1] - coordinate2[1]) ** 2
  );
  return distance;
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
      G.addWeightedEdgesFrom([[i, i - 1, distance(coordinates[i], coordinates[i - 1])]]);
      // Add weight to each edges so that the weight is equal to the distance between the two nodes
      // G.adj.get(i).get(i - 1).weight = distance(coordinates[i], coordinates[i - 1]);
    }
  }
  G.addWeightedEdgesFrom([
    [0, numberOfNodes - 1, distance(coordinates[0], coordinates[numberOfNodes - 1])]
  ]);
  // G.adj.get(0).get(numberOfNodes - 1).weight = distance(
  //  coordinates[0],
  //  coordinates[numberOfNodes - 1]
  // );
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
    return true;
  }
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

var main = function() {
  var inputValue = input();
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
};

if (require.main === module) {
  main();
}
module.exports = {
  distance,
  input,
  initialGraph,
  isConnected,
  isBridge,
  adjacencyMatrix
};
