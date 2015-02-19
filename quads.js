var RawPixelData;
var ctx;
var context = [];

var timer;

var RectScores = [];
var RectScores[0] = [];
var RectScores[1] = [];
var RectScores[2] = [];
var RectScores[3] = [];

function Score(score, rect) {
	this.score = score;
	this.rect = rect;
}

function Rect(startX, startY, width, height) {
	this.startX = startX;
	this.startY = startY;
	this.width = width;
	this.height = height;
}

function draw(n) {
	RectScores[n].sort(function(a, b) { return b.score - a.score; } );

	iterate(RectScores[n].shift().rect, n);

	setTimeout(function() { draw(n) }, 100);
}

function drawTargetImage() {
	var canvas = document.getElementById('targetImg');
	ctx = canvas.getContext("2d");
	var srcImg = new Image();
	srcImg.src = "http://zachsadler.com/iterative-quads/target.jpg";
	srcImg.onload = function() {
		ctx.drawImage(srcImg, 0, 0, 480, 640);
		getPixelData();
	}
	var canvas2 = document.getElementById('workingImg1');
	context[0] = canvas2.getContext("2d");
	canvas2 = document.getElementById('workingImg2');
	context[1] = canvas2.getContext("2d");
	canvas2 = document.getElementById('workingImg3');
	context[2] = canvas2.getContext("2d");
	canvas2 = document.getElementById('workingImg4');
	context[3] = canvas2.getContext("2d");
}

function getPixelData() {
	RawPixelData = ctx.getImageData(0, 0, 480, 640).data;

	iterate(new Rect(0, 0, 240, 320), 0);
	draw(0);
	iterate(new Rect(120, 0, 240, 320), 1);
	draw(1);
	iterate(new Rect(0, 160, 240, 320), 2);
	draw(2);
	iterate(new Rect(120, 160, 240, 320), 3);
	draw(3);
}

function averageColorOfRect(rect) {
	var r = 0, g = 0, b = 0;

	var newPixelData = ctx.getImageData(rect.startX, rect.startY, rect.width, rect.height).data;
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

function differenceFromAverage(rgb1, rgb2) {
	return (rgb1[0] - rgb2[0])*(rgb1[0] - rgb2[0]) + (rgb1[1] - rgb2[1])*(rgb1[1] - rgb2[1]) + (rgb1[2] - rgb2[2])*(rgb1[2] - rgb2[2]);
}

function iterate(rect, n) {

	if (rect.width <= 1 || rect.height <= 1)
		return;

	// find the average color of the full rect and each quadrant
	var wholeAverage = averageColorOfRect(rect);

	var quads = [new Rect(rect.startX, rect.startY, rect.width/2, rect.height/2), new Rect(rect.startX + rect.width/2, rect.startY, rect.width/2, rect.height/2), new Rect(rect.startX, rect.startY + rect.height/2, rect.width/2, rect.height/2), new Rect(rect.startX + rect.width/2, rect.startY + rect.height/2, rect.width/2, rect.height/2)];

	var firstQuad = averageColorOfRect(quads[0]);
	var secondQuad = averageColorOfRect(quads[1]);
	var thirdQuad = averageColorOfRect(quads[2]);
	var fourthQuad = averageColorOfRect(quads[3]);

	context[n].fillStyle = "#" + Math.floor(firstQuad[0]).toString(16)  + Math.floor(firstQuad[1]).toString(16) + Math.floor(firstQuad[2]).toString(16);
	context[n].fillRect(rect.startX, rect.startY, rect.width/2, rect.height/2);

	context[n].fillStyle = "#" + Math.floor(secondQuad[0]).toString(16)  + Math.floor(secondQuad[1]).toString(16) + Math.floor(secondQuad[2]).toString(16);
	context[n].fillRect(rect.startX + rect.width/2, rect.startY, rect.width/2, rect.height/2);

	context[n].fillStyle = "#" + Math.floor(thirdQuad[0]).toString(16)  + Math.floor(thirdQuad[1]).toString(16) + Math.floor(thirdQuad[2]).toString(16);
	context[n].fillRect(rect.startX, rect.startY + rect.height/2, rect.width/2, rect.height/2);

	context[n].fillStyle = "#" + Math.floor(fourthQuad[0]).toString(16)  + Math.floor(fourthQuad[1]).toString(16) + Math.floor(fourthQuad[2]).toString(16);
	context[n].fillRect(rect.startX + rect.width/2, rect.startY + rect.height/2, rect.width/2, rect.height/2);

	var firstDiff = differenceFromAverage(wholeAverage, firstQuad);
	var secondDiff = differenceFromAverage(wholeAverage, secondQuad);
	var thirdDiff = differenceFromAverage(wholeAverage, thirdQuad);
	var fourthDiff = differenceFromAverage(wholeAverage, fourthQuad);

	RectScores[n].push(new Score(firstDiff, quads[0]));
	RectScores[n].push(new Score(secondDiff, quads[1]));
	RectScores[n].push(new Score(thirdDiff, quads[2]));
	RectScores[n].push(new Score(fourthDiff, quads[3]));
}

drawTargetImage();

// web workers?
// one big call to get the image data, then workers to break it up?
// build the average colors from bottom up, or as needed?
// to start, lets just go top down and average as needed