// class dealing with initializing new generation of nets

class Generation {
    constructor(arrNodes, popSize, genNum, mutationRate) {
        this.popSize = popSize;
        this.genNum = genNum;
        this.nodesArr = arrNodes;
        this.pop = [];
        this.mutationRate = mutationRate;
    }

    // method run at beginning for initial population of nets
    initializeNets() {
        for (let i = 0; i < this.popSize; i++) {
            let net = new neuralNet(this.nodesArr);
            net.initLayers();

            this.pop.push(net);
        }
    }

    // initializes new nets based on two best nets from passed in gen
    static genFromGen(nn1, nn2, popSize, genNum, mutationRate) {
        let newGen = new Generation(nn1.nodesArr, popSize, genNum);
        for (let i = 0; i < newGen.popSize; i++) {
            newGen.pop.push(
                neuralNet.crossover(nn1, nn2, mutationRate)
            );
        }
        return newGen;
    }
}