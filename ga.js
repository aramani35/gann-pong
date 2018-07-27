class Generation {
    constructor(arrNodes, popSize, genNum) {
        this.popSize = popSize;
        this.genNum = genNum;
        this.nodesArr = arrNodes;
        this.pop = [];
    }

    initializeNets() {
        for (let i = 0; i < this.popSize; i++) {
            let net = new neuralNet(this.nodesArr);
            net.initLayers();

            this.pop.push(net);
        }
    }

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