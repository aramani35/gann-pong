class neuralNet {
    constructor(arrN) {
        this.nodesArr = arrN;
        this.layers = [];
    }

    initLayers() {
        for (let i = 0; i < this.nodesArr.length-1; i++) {
            let lay = new layer(this.nodesArr[i], this.nodesArr[i+1]);
            lay.randomInitialization();
            this.layers.push(lay);
        }
    }

    feedforward(inputArr) {
        if (inputArr.length != this.nodesArr[0]) {
            console.log('Incorrect input size');
        }

        else {
            let activationVals = [];
            let outputVec = inputArr;
            let activ = 'relu';
            for (let i = 0; i < this.layers.length; i++) {
                if (i == this.layers.length - 1) { activ = 'softmax'; }
                outputVec = this.layers[i].forwardProp(outputVec, activ);
                activationVals.push(outputVec);
            }

            return activationVals;
        }
    }

    print() {
        for (var i = 0; i < this.layers.length; i++) {
            console.log('LAYER ' + String(i+1));
            this.layers[i].print();
        }
    }

    static crossover(nn1, nn2, mutationRate) {
        if(nn1.arrN != nn2.arrN) {
            console.log('NNets have mismatched shape');
        }

        else {
            let newNet = new neuralNet(nn1.nodesArr);
            for (let i = 0; i < newNet.nodesArr.length-1; i++) {
                let crossPoint = math.floor(math.random()*newNet.nodesArr[i+1]);
                let newLay = layer.crossLayers(nn1.layers[i], nn2.layers[i], crossPoint, mutationRate);
                newNet.layers.push(newLay);
            }

            return newNet;
        }
    }
}

class layer {
    constructor(numInputs, numOutputs) {
        this.weightMatrix = math.zeros(numOutputs, numInputs);
        this.biasVector = math.zeros(numOutputs, 1);
    }

    randomInitialization() {
        this.weightMatrix = this.weightMatrix.map(function() {
            return math.random(-1, 1);
        });
        this.biasVector = this.biasVector.map(function() {
            return math.random(-1, 1);
        });
    }

    print() {
        console.log('Weights');
        console.table(this.weightMatrix._data);
        console.log('Biases');
        console.table(this.biasVector._data);
    }

    forwardProp(inputVec, activation) {
        let z = math.add(math.multiply(this.weightMatrix, inputVec), this.biasVector);
        if (activation == 'relu') {
            return z.map(function(value) {
                return math.max(value, 0);
            });
        }

        else if (activation == 'softmax') {
            let expsum = 0;
            z = z.map(function(value) {
                return math.exp(value);
            });
            z.forEach(function(value) {
                expsum += value;
            })

            return math.divide(z, expsum);
        }
    } 

    static crossLayers(lay1, lay2, crossPoint, mutationRate) {
        let crossedLay = new layer(
            math.size(lay1.weightMatrix)._data[1], 
            math.size(lay1.weightMatrix)._data[0]
        );
        crossedLay.weightMatrix = crossedLay.weightMatrix.map(function(value, index) {
            var val = 0;
            if (index[0] <= crossPoint) {
                val = lay1.weightMatrix.get(index);
            }

            else {
                val = lay2.weightMatrix.get(index);
            }

            if (math.random() < mutationRate) {
                val = math.random(-1, 1);
            }
            return val;
        });
        
        crossedLay.biasVector = crossedLay.biasVector.map(function(value, index) {
            var val = 0;
            if (index[0] <= crossPoint) {
                val = lay1.biasVector.get(index);
            }

            else {
                val = lay2.biasVector.get(index);
            }

            if(math.random() < mutationRate) {
                val = math.random(-1, 1);
            }
            return val;
        });

        return crossedLay;

    }
}

const begHeight = 400;
const windWidth = 800;
const windHeight = 400;

class nnVis {
    constructor(net) {
        this.nodesArr = net.nodesArr;
        this.numLayers = this.nodesArr.length;
        this.nodes = [];
        this.connections = [];
        this.genNodes();
        this.genConnections();
    }

    genNodes() {
        var startXPos = 0;
        var startYPos = begHeight + 50;
        var endXPos = 400;
        var endYPos = begHeight + 400;
        var xDist = (endXPos - startXPos) / (this.numLayers+1);
        var yDif = endYPos - startYPos;
        var yDist = 0;
        var nodes = [];
        for (var i = 0; i < this.numLayers; i++) {
            yDist = yDif / (this.nodesArr[i] + 1)
            var layer = []
            for (var j = 0; j < this.nodesArr[i]; j ++) {
                layer.push([
                    startXPos + xDist*(i+1),
                    startYPos + yDist*(j+1),
                    yDist/2,
                    255, 
                    255, 
                    255
                ]);
            }
            nodes.push(layer);
        }
        
        this.nodes = nodes;
    }

    genConnections() {
        let con = [];
        for (let i = 0; i < this.nodes.length-1; i++) {
            let layerCon = [];
            for (var j = 0; j < this.nodes[i].length; j++) {
                let nodeCon = [];
                for (var k = 0; k < this.nodes[i+1].length; k++) {
                    nodeCon.push([
                        this.nodes[i][j][0],
                        this.nodes[i][j][1],
                        this.nodes[i+1][k][0],
                        this.nodes[i+1][k][1],
                        125,
                        1
                    ])
                }
                layerCon.push(nodeCon);
            }
            con.push(layerCon);
        }
        this.connections = con;
    }

    showNodes() {
        for(var i = 0; i < this.nodes.length; i++) {
            for(var j = 0; j < this.nodes[i].length; j++){
                fill(this.nodes[i][j][3], this.nodes[i][j][4], this.nodes[i][j][5]);
                ellipse(this.nodes[i][j][0], this.nodes[i][j][1], this.nodes[i][j][2]);
            }
        }
    }

    showConnections() {
        for (let i = 0; i < this.connections.length; i++) {
            for (let j = 0; j < this.connections[i].length; j++) {
                for (let n = 0; n < this.connections[i][j].length; n++) {
                    stroke(this.connections[i][j][n][4]);
                    strokeWeight(this.connections[i][j][n][5]);
                    line(
                        this.connections[i][j][n][0],
                        this.connections[i][j][n][1],
                        this.connections[i][j][n][2],
                        this.connections[i][j][n][3]
                    );
                }
            }
        }
    }

    showLayerActivations(layerActivations) {
        for(var i = 1; i < this.nodes.length; i++) {
            for(var j = 0; j < this.nodes[i].length; j++) {
                this.nodes[i][j][3] = 255*(math.max(0, 1-layerActivations[i-1]._data[j]));
                this.nodes[i][j][4] = 255*(math.max(0, 1-layerActivations[i-1]._data[j]));
                //this.nodes[i][j][5] = 255*(math.max(0, 1-layerActivations[i-1]._data[j]));
            }
        }
    }

    showInputActivations(inputActivations) {
        for(var j = 0; j < this.nodes[0].length; j++) {
            this.nodes[0][j][3] = 255*(math.max(0, 1 - inputActivations[j][0]));
            this.nodes[0][j][4] = 255*(math.max(0, 1 - inputActivations[j][0]));
            //this.nodes[0][j][5] = 255*(math.min(1, 0 + inputActivations[j][0]));

        }
    }
}