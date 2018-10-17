'use strict';
class Operation{
    constructor(a,b){
        this.points = [a,b];
    }
    addPoints(){
        var sum = this.points[1] + this.points[0];
        return(sum);
    }
};
var node = new Operation(1,2);
console.log(node.addPoints())
module.exports = {Operation};