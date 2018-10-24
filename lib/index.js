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

function initialGraph(numberOfNodes, coordinates) {
  /* This function initialize the initial connect graph based on user input 

  Args: 
  numberOfNodes: the number of nodes by user input (Number)
  coordinates: the coordinates of the nodes (Array)

  returns:
  G: the initial connected graph that each node is connected to its previous node and next node */
  var G = new jsnx.Graph();
  for (var i = 0; i < numberOfNodes; i++) {
    G.addNode(i, { coordinate: [coordinates[i * 2], coordinates[i * 2 + 1]] });
    if (i !== 0) {
      G.addEdge(i, i - 1);
    }
  }
  G.addEdge(0, numberOfNodes - 1);
  console.log(G.nodes());
  console.log(G.edges());
  // Var cor = G.node.get(1).coordinate;
  return G;
}

var main = function() {
  var inputValue = input();
  var r = inputValue.r;
  var T = inputValue.t;
  var numberOfNodes = inputValue.number;
  var coordinates = JSON.parse('[' + inputValue.coordinate + ']');
  var G = initialGraph(numberOfNodes, coordinates);
  console.log(G);
};

if (require.main === module) {
  main();
}

class MarkovProbability {
  constructor(xi, xj) {
    this.xs = [xi, xj];
  }

  piRatio() {
    var f = Math.exp(this.xs[0] + this.xs[1]);
    return f;
  }
}

var node = new MarkovProbability(0.5, 0.5);
console.log(node.piRatio());
module.exports = { MarkovProbability };
