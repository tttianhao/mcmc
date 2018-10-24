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

var main = function() {
  var inputValue = input();
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
var G = new jsnx.Graph();
G.addNode(1, { coordinate: [1, 2] });
G.addNode(2);
G.addNode(3);
console.log(G.nodes());
G.node.get(2).coordinate = [2, 0];
console.log(G.nodes(true));
var cor = G.node.get(1).coordinate;
console.log(cor[0]);
