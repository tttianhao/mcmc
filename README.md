# mcmc [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url] [![Coverage percentage][coveralls-image]][coveralls-url]
> markov chain monte carlo

## Introduction

This project is an implementation of Metropolis-Hastings algorithm to find the most probable graphs based on user input. User can specify the number of nodes, the coordination of the nodes, the source node, r, t factors and the number of iterations. The relative probability of the graphs are given by the following function:

$$ f ( \{ s_i , X_i \}, \{s_j , X_j\}) = e^{-(\theta(s_j,X_j) - \theta(s_i,X_i))/T} $$

where,

$$\theta(s_i,X_i) = r\sum_e w_e+\sum_k^M \sum_{e \in p_{s_i k}} w_e$$

In this equation, the first sum is the total weight of the graph (weight of an edge is the distance between the two nodes). The second sum is the total weight of source node to other nodes.

The proposal distribution is defined such that in case of adding an edge:

$$q(j|i) = \frac{1}{\frac{M(M-1)}{2}-E}$$

where the M is the number of nodes and the M term is the maximum number of edges. E is the number of edges in current state.

In case of deleting an edge:

$$q(j|i) = \frac{1}{E -B}$$

where B is the number of bridge. Bridge is an edge which will make the graph disconnected if being deleted.

The acceptance rate is defined as following:

$$A = min\{ 1, \frac{\pi (x_j) q(x_i|x_j)}{\pi (x_i)q(x_j|x_i)} \}$$

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
* --coordinate: the coordinate of nodes. Input format: $x_1,y_1,x_2,y_2,x_3,y_3...$. Default is $0,0,1,1,-1,1,1,-1$
* --N: the number of iterations. Default is 1000

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
