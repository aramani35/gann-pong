const mult = 2;

class Puck {
    constructor() {
        this.r = 20;
        this.xPos = windWidth / 2;
        this.yPos = windHeight / 2;
        this.velX = 6 * mult;
        this.velY = random(-6, 6) * mult;
        this.out = false;
        
    }

    move(padL, padR) {
        if (!this.out) {
            var exceedVert = ((this.yPos - this.r/2) <= 0) || ((this.yPos + this.r/2) >= windHeight);
            var exceedHorz = ((this.xPos - this.r/2) <= 0) || ((this.xPos + this.r/2) >= windWidth);
            var hitLeft = ((this.xPos - this.r/2) <= padL.xPos + padL.w) && (this.yPos >= padL.yPos) && (this.yPos <= (padL.yPos + padL.l));
            var hitRight = ((this.xPos + this.r/2) >= padR.xPos) && (this.yPos >= padR.yPos) && (this.yPos <= (padR.yPos + padR.l));

            if (exceedVert) {
                this.velY = -this.velY + random(-1, 1);
                if ((this.yPos - this.r/2) <= 0) { this.yPos = 0 + this.r; }
                else { this.yPos = windHeight - this.r; }
             }

            if (hitLeft || hitRight) { 
                this.velX = -this.velX + random(-1, 1);;
                if(hitLeft) { this.xPos = padL.xPos + padL.w + this.r/2; }
                else if(hitRight) { this.xPos = padR.xPos - this.r/2 ;}
             }

            if (exceedHorz) { this.out = true; }

            if(this.velX > 0) { this.velX = max(6*mult, this.velX); }
            else if(this.velX < 0) { this.velX = min(-6*mult, this.velX); }

            if(this.velY > 0) { this.velY = max(4*mult, this.velY); }
            else if(this.velY < 0) { this.velY = min(-4*mult, this.velY); }

            this.xPos += this.velX;
            this.yPos += this.velY;
            this.show();
        }

    }

    getOut() {
        return this.out;
    }

    resetOut() {
        this.out = false; 
    }

    getY() {
        return this.yPos;
    }

    leftWon() {
        if (this.xPos > windWidth/2) { return true; }
        else { return false; }
    }

    show() {
        fill(255);
        ellipse(this.xPos, this.yPos, this.r, this.r);
    }
}

class Paddle {
    constructor(left) {
        this.left = left;
        if (left) { this.xPos = 10; }
        else { this.xPos = windWidth - 20; }
        this.yPos = windHeight / 2 - 40;
        this.w = 10;
        this.l = 80;
        this.score = 0;
        this.yDir = 0;
        this.speed = 4*mult;
    }

    show(r, g, b, alpha) {
        fill(r, g, b, alpha);
        strokeWeight(0);
        rect(this.xPos, this.yPos, this.w, this.l);
    }

    getScore() {
        return this.score;
    }

    setScore(newScore) {
        this.score = newScore;
    }
}

class playerPaddle extends Paddle {
    constructor(left) {
        super(left);
        this.humanPlay = false;
    }

    perfectMove(puckY) {
        this.yPos = puckY - this.l/2;
        if (this.yPos + this.l >= windHeight) { this.yPos = windHeight - this.l; }
        else if (this.yPos <= 0) { this.yPos = 0; }
    }

    setDir(dir) {
        this.yDir = dir;
    }

    move(puckY) {
        if (this.humanPlay) { this.humanMove(); }
        else { this.perfectMove(puckY); }
    }

    humanMove() {
        this.yPos = this.yPos + this.yDir*this.speed;
        if (this.yPos < 0) { this.yPos = 0; } 
        if (this.yPos + this.l > windHeight) { this.yPos = windHeight - this.l; }
    }

    flipHuman() {
        this.humanPlay = !this.humanPlay;
    }

    getHuman() {
        return this.humanPlay;
    }
}

class nnPaddle extends Paddle {
    constructor(left, netDim) {
        super(left);
        this.net = new neuralNet(netDim);
        this.net.initLayers();
        this.vis = new nnVis(this.net);
    }

    move(input) {
        // get forward prop output and activation
        let activationVals = this.net.feedforward(input);
        let dirVec = math.matrix(activationVals[activationVals.length-1]);
        let dir = 0;
        let max = 0;
        dirVec.forEach(function(value, index) {
            if (value > max) {
                max = value;
                dir = index[0] - 1;
            }
        })
        this.yPos += mult*4*dir;

        this.vis.showInputActivations(input);
        this.vis.showLayerActivations(activationVals);
        this.vis.showConnections();
        this.vis.showNodes();

        if (this.yPos < 0) { this.yPos = 0; }
        else if (this.yPos + this.l > windHeight) { this.yPos = windHeight - this.l; }
    }
}

class scoringSystem {
    constructor() {
        this.leftScore = 0;
        this.rightScore = 0;
    }

    setLeft(val) {
        this.leftScore = val;
    }

    setRight(val) {
        this.rightScore = val;
    }

    show() {
        textSize(20);
        fill(255);
        stroke(100);
        strokeWeight(3);
        text(this.leftScore, 30, 10, 20, 30);
        text(this.rightScore, windWidth - 45, 10, windWidth, 30);
    }
}

class Pong {
    constructor(generation) {
        this.puck = new Puck();
        this.pad1 = new playerPaddle(true);
        this.generation = generation;
        this.pad2 = new nnPaddle(false, generation.nodesArr);
        this.begin = false;
        this.scoreBoard = new scoringSystem();
        this.startTime = millis();
        this.endTime = millis();
        this.gameTime = 0;
        this.gameTimes = [];
        this.genTimes = [];
        this.memberCount = 1;
    }

    setBegin(beg) {
        this.begin = beg;
        this.pad2.net = this.generation.pop[this.memberCount - 1];
    }

    playPong() {
        if (this.begin) {
            this.play();
        }

        else {
            this.pad2.yPos = windHeight/2 - this.pad2.l/2;
            this.puck.show();
            this.pad1.show(0, 150, 255, 255);
            this.pad2.show(255, 0, 0, 255);
            this.scoreBoard.show();
            this.startTime = millis();
            text('Generation ' + String(this.generation.genNum), 340, 20);
            text('Member ' + String(this.memberCount), 355, 40);
        }
    }

    play() {
        this.scoreBoard.show();
        text('Generation ' + String(this.generation.genNum), 340, 20);
        text('Member ' + String(this.memberCount), 355, 40);
        this.pad1.move(this.puck.getY());
	    this.pad2.move(this.nnOutputs());
	
	    this.puck.move(this.pad1, this.pad2);
	    this.pad2.show(255, 0, 0, 255);
	    this.pad1.show(0, 150, 255, 255);

	    if (this.puck.getOut()) {
		    if (this.puck.leftWon()) { 
                this.pad1.setScore(this.pad1.getScore()+1); 
                this.scoreBoard.setLeft(this.scoreBoard.leftScore+1);
            }
		    else {
                this. pad2.setScore(this.pad2.getScore()+1); 
                this.scoreBoard.setRight(this.scoreBoard.rightScore+1);

                this.pad2.net = this.generation.pop[this.memberCount-1];

                if (this.memberCount > this.generation.pop.length) {
                    let sum = this.gameTimes.reduce(function(a, b) { return a + b; });
                    let avg = sum / this.gameTimes.length;
                    this.genTimes.push(avg);
                    let ind1 = this.gameTimes.indexOf(math.max(this.gameTimes));
                    this.gameTimes.splice(ind1, 1);
                    let ind2 = this.gameTimes.indexOf(math.max(this.gameTimes));
    
                    let net1 = this.generation.pop[ind1];
                    let net2 = this.generation.pop[ind2];
                    this.generation = Generation.genFromGen(net1, net2, this.generation.popSize, this.generation.genNum+1, .1);
                    this.gameTimes = [];
                    this.memberCount = 1;
                    this.pad2.net = this.generation.pop[this.memberCount-1];
                }
            }
            this.endTime = millis();
            this.gameTime = this.endTime - this.startTime;
            this.gameTimes.push(this.gameTime);
            this.startTime = millis();
            if (this.pad1.humanPlay){ this.begin = false; }
            this.pad2.yPos = windHeight/2 - this.pad2.l/2;
            this.memberCount++;

		    this.puck = new Puck();
	    }
    }

    nnOutputs() {
        var outs = [
            [this.pad2.yPos / windHeight],
            [this.puck.xPos / windWidth],
            [this.puck.yPos / windHeight],
            [this.puck.velX / 6*mult],
            [this.puck.velY / 6*mult],
        ];

        return outs;
    }

    getGenerationTimes() {
        return this.genTimes;
    }
}

