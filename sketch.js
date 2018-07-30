let pong;

let maxFitness = 0;
let generation; 

let topBuffer;
let botBuffer;

let myFont;
function preload() {
  myFont = loadFont('assets/unisansthin.otf');
}

// passable parameters: nn depth, # of hidden nodes per layr,
// population size, mutation rate

function setup() {
	createCanvas(800, 800);
	topBuffer = createGraphics(800, 400);
	botBuffer = createGraphics(800, 400);
	generation = new Generation([5, 4, 4, 4, 3], 50, 1, .01);
	generation.initializeNets(); 
	pong = new Pong(generation);
}

function draw() {
	drawTopBuffer();
	drawBotBuffer();
	image(topBuffer, 0, 0);
	image(botBuffer, 0, 400);

	strokeWeight(0);
	pong.playPong();

	labels();

	times = pong.getGenerationTimes();
	if (times != []) {
		maxFitness = Math.max.apply(null, times);

		beginShape();
		stroke(100);
		strokeWeight(2);
		noFill();
		for(var i = 0; i < times.length; i++) {
			var x = map(i, 0, times.length-1, 401, 800);
			var y = map(times[i], 0, maxFitness, height, 450);
			vertex(x, y);
		}
		if (times.length == 1) {
			vertex(401, y);
			vertex(width, y);
		}
		endShape();
	}
}

function keyPressed() {
	if (key == ' ') {
		pong.pad1.flipHuman();
	}

	if (keyCode == DOWN_ARROW) { pong.pad1.setDir(1); }
	else if (keyCode == UP_ARROW) { pong.pad1.setDir(-1); }

	if (keyCode == ENTER) {
		if (pong.begin) { pong.setBegin(false); }
		else { pong.setBegin(true); }
	}
}

function keyReleased() {
	pong.pad1.setDir(0);
}

function drawTopBuffer() {
	topBuffer.background(50, 50, 50);
}

function drawBotBuffer() {
	botBuffer.background(255, 255, 255);
}

function labels() {
	textFont(myFont);
	stroke(0);
	strokeWeight(2);
	line(400, 400, 400, 800);
	fill(0);
	textSize(30);
	strokeWeight(1);
	text('Neural Network Model', 20, 420, 400, 480);
	text('Fitness Graph', 420, 420, 800, 480);
	textSize(15);
	text('up', 325, 495, 400, 520);
	text('neutral', 325, 585, 400, 630);
	text('down', 325, 670, 400, 680);
	stroke(150, 150, 255, 127);
	for (let i = 450; i <= 750; i+=50) {
		line(i, 450, i, 800);
		line(400, i, 800, i);
	}
}