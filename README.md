# mcmc [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url] [![Coverage percentage][coveralls-image]][coveralls-url]
> markov chain monte carlo

## Introduction

This project is an implementation of Metropolis-Hastings algorithm to find the most probable graphs based on user input. User can specify the number of nodes, the coordination of the nodes, the source node, r, t factors and the number of iterations. The relative probability of the graphs are given by the following function:

![](http://latex.codecogs.com/gif.latex?f%20%28%20%5C%7B%20s_i%20%2C%20X_i%20%5C%7D%2C%20%5C%7Bs_j%20%2C%20X_j%5C%7D%29%20%3D%20e%5E%7B-%28%5Ctheta%28s_j%2CX_j%29%20-%20%5Ctheta%28s_i%2CX_i%29%29/T%7D)

where,

![](http://latex.codecogs.com/gif.latex?%5Ctheta%28s_i%2CX_i%29%20%3D%20r%5Csum_e%20w_e&plus;%5Csum_k%5EM%20%5Csum_%7Be%20%5Cin%20p_%7Bs_i%20k%7D%7D%20w_e)

In this equation, the first sum is the total weight of the graph (weight of an edge is the distance between the two nodes). The second sum is the total weight of source node to other nodes.

The proposal distribution is defined such that in case of adding an edge:

![](http://latex.codecogs.com/gif.latex?q%28j%7Ci%29%20%3D%20%5Cfrac%7B1%7D%7B%5Cfrac%7BM%28M-1%29%7D%7B2%7D-E%7D)

where the M is the number of nodes and the M term is the maximum number of edges. E is the number of edges in current state.

In case of deleting an edge:

![](http://latex.codecogs.com/gif.latex?q%28j%7Ci%29%20%3D%20%5Cfrac%7B1%7D%7BE%20-B%7D)

where B is the number of bridge. Bridge is an edge which will make the graph disconnected if being deleted.

The acceptance rate is defined as following:

![](http://latex.codecogs.com/gif.latex?A%20%3D%20min%5C%7B%201%2C%20%5Cfrac%7B%5Cpi%20%28x_j%29%20q%28x_i%7Cx_j%29%7D%7B%5Cpi%20%28x_i%29q%28x_j%7Cx_i%29%7D%20%5C%7D)

## Installation

```sh
$ git clone https://github.com/tttianhao/mcmc.git
$ npm install --save mcmc
```

## Usage

```js
$ node lib/index.js
```

### Arguments

* --t: the T factor in relative probability equation. Default is 100
* --r: the r facotr in theta equation. Default is 1
* --number: the number of nodes. Default is 4
* --coordinate: the coordinate of nodes. Input format: x_1,y_1,x_2,y_2,x_3,y_3.... Default is 0,0,1,1,-1,1,1,-1
* --iterate: the number of iterations. Default is 1000
* --center: the source node. Default is node 0

## License

MIT © [Tianhao Yu]()


[npm-image]: https://badge.fury.io/js/mcmc.svg
[npm-url]: https://npmjs.org/package/mcmc
[travis-image]: https://travis-ci.org/tttianhao/mcmc.svg?branch=master
[travis-url]: https://travis-ci.org/tttianhao/mcmc
[daviddm-image]: https://david-dm.org/tttianhao/mcmc.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/tttianhao/mcmc
[coveralls-image]: https://coveralls.io/repos/tttianhao/mcmc/badge.svg
[coveralls-url]: https://coveralls.io/r/tttianhao/mcmc
