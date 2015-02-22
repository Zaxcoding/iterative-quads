var targetImageCtx;
var workingImageCtxArray;
var RectScores;

var QuadsToStartOut = 4;
var TargetImage = "owl.jpg";
var DrawTimeout = 25;

// simple object to hold the score and corresponding rect
function Score(score, rect) {
	this.score = score;
	this.rect = rect;
}

// simple object to describe the dimensions and location of each rect
function Rect(startX, startY, width, height) {
	this.startX = startX;
	this.startY = startY;
	this.width = width;
	this.height = height;
}

// find the rect with worst score, pop it out of the array, and iterate on it
function draw(n) {
	RectScores[n].sort(function(a, b) { return b.score - a.score; } );

	iterate(RectScores[n].shift().rect, n);

	setTimeout(function() { draw(n) }, DrawTimeout);
}

function drawTargetImage(target) {

	// this is the target image we are trying to replicate
	var canvas = document.getElementById('targetImg');
	targetImageCtx = canvas.getContext("2d");
	var srcImg = new Image();
	srcImg.src = "http://zachsadler.com/iterative-quads/" + target;
	srcImg.onload = function() {
		targetImageCtx.drawImage(srcImg, 0, 0, 480, 640);
		setupAndGetGoing();
	}
}

function reinitializeVariables() {

 	workingImageCtxArray = [];
	RectScores = [];
	var workingCanvas;

	for (var i = 0; i < QuadsToStartOut; i++) {
		RectScores[i] = [];
		workingCanvas = document.getElementById('workingImg' + (i+1));
	  workingImageCtxArray[i] = workingCanvas.getContext("2d");
	}
}

function setupAndGetGoing() {
	reinitializeVariables();

	for (var i = 0; i < QuadsToStartOut; i++) {
		iterate(new Rect(0, 0, 240, 320), i);
		draw(i);
	}
}

function averageColorOfRect(rect, n) {
	var r = 0, g = 0, b = 0;

	if (rect.width < 1 || rect.height < 1) {
		return -Infinity;
	}

	var newPixelData = targetImageCtx.getImageData(rect.startX + (n==1 || n ==3)*240, rect.startY + (n==2 || n == 3)*320, Math.floor(rect.width), Math.floor(rect.height)).data;
	for (var i = 0, n = newPixelData.length; i < n; i += 4) {
		r += newPixelData[i];
		g += newPixelData[i+1];
		b += newPixelData[i+2];
	}
	r /= (newPixelData.length/4);
	g /= (newPixelData.length/4);
	b /= (newPixelData.length/4);

	ans = [r, g, b];
	return ans;
}

// simple euclidean distance
function differenceFromAverage(rgb1, rgb2) {
	return (rgb1[0] - rgb2[0])*(rgb1[0] - rgb2[0]) + (rgb1[1] - rgb2[1])*(rgb1[1] - rgb2[1]) + (rgb1[2] - rgb2[2])*(rgb1[2] - rgb2[2]);
}

function iterate(rect, n) {

	if (rect.width < 2 && rect.height < 2)
		return;

	if (rect.width < 2)
		rect.width = 2;

	if (rect.height < 2)
		rect.height = 2;

	// find the average color of the full rect and each quadrant
	var wholeAverage = averageColorOfRect(rect, n);

	var quads = [new Rect(rect.startX, rect.startY, rect.width/2, rect.height/2), new Rect(rect.startX + rect.width/2, rect.startY, rect.width/2, rect.height/2), new Rect(rect.startX, rect.startY + rect.height/2, rect.width/2, rect.height/2), new Rect(rect.startX + rect.width/2, rect.startY + rect.height/2, rect.width/2, rect.height/2)];

	var quadAverages = [];
	var differences = [];
	for (var i = 0; i < 4; i++) {
		quadAverages[i] = averageColorOfRect(quads[i], n);
		workingImageCtxArray[n].fillStyle = "#" + ("00" + Math.floor(quadAverages[i][0]).toString(16)).slice(-2)  + ("00" + Math.floor(quadAverages[i][1]).toString(16)).slice(-2) + ("00" + Math.floor(quadAverages[i][2]).toString(16)).slice(-2);
		workingImageCtxArray[n].fillRect(quads[i].startX, quads[i].startY, quads[i].width, quads[i].height);
		differences[i] = differenceFromAverage(wholeAverage, quadAverages[i]);
		RectScores[n].push(new Score(differences[i] * Math.pow(rect.width*rect.height, .85) , quads[i]));
	}
}

drawTargetImage(TargetImage);
