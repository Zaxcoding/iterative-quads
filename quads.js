var RawPixelData;
var ctx;
var context;

var timer;

var RectScores = [];

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

function draw() {
	RectScores.sort(function(a, b) { return b.score - a.score; } );

	iterate(RectScores.shift().rect);

	timer = setTimeout(draw, 100);
}

function drawTargetImage() {
	var canvas = document.getElementById('targetImg');
	ctx = canvas.getContext("2d");
	var srcImg = new Image();
	srcImg.src = "http://zachsadler.com/iterative-quads/target.jpg";
	srcImg.onload = function() {
		context.drawImage(srcImg, 0, 0, 480, 640);
		getPixelData();
	}
	var canvas2 = document.getElementById('workingImg');
	context = canvas2.getContext("2d");
}

function getPixelData() {
	var canvas = document.getElementById('targetImg');
	var context = canvas.getContext("2d");
	RawPixelData = context.getImageData(0, 0, canvas.width, canvas.height).data;

	iterate(new Rect(0, 0, canvas.width, canvas.height));
	draw();
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

function iterate(rect) {

	if (rect.width < 2.5 || rect.height < 2.5)
		return;

	// find the average color of the full rect and each quadrant
	var wholeAverage = averageColorOfRect(new Rect(rect.startX, rect.startY, rect.width, rect.height));

	var quads = [new Rect(rect.startX, rect.startY, rect.width/2, rect.height/2), new Rect(rect.startX + rect.width/2, rect.startY, rect.width/2, rect.height/2), new Rect(rect.startX, rect.startY + rect.height/2, rect.width/2, rect.height/2), new Rect(rect.startX + rect.width/2, rect.startY + rect.height/2, rect.width/2, rect.height/2)];

	var firstQuad = averageColorOfRect(quads[0]);
	var secondQuad = averageColorOfRect(quads[1]);
	var thirdQuad = averageColorOfRect(quads[2]);
	var fourthQuad = averageColorOfRect(quads[3]);

	context.fillStyle = "#" + Math.floor(firstQuad[0]).toString(16)  + Math.floor(firstQuad[1]).toString(16) + Math.floor(firstQuad[2]).toString(16);
	context.fillRect(rect.startX, rect.startY, rect.width/2, rect.height/2);

	context.fillStyle = "#" + Math.floor(secondQuad[0]).toString(16)  + Math.floor(secondQuad[1]).toString(16) + Math.floor(secondQuad[2]).toString(16);
	context.fillRect(rect.startX + rect.width/2, rect.startY, rect.width/2, rect.height/2);

	context.fillStyle = "#" + Math.floor(thirdQuad[0]).toString(16)  + Math.floor(thirdQuad[1]).toString(16) + Math.floor(thirdQuad[2]).toString(16);
	context.fillRect(rect.startX, rect.startY + rect.height/2, rect.width/2, rect.height/2);

	context.fillStyle = "#" + Math.floor(fourthQuad[0]).toString(16)  + Math.floor(fourthQuad[1]).toString(16) + Math.floor(fourthQuad[2]).toString(16);
	context.fillRect(rect.startX + rect.width/2, rect.startY + rect.height/2, rect.width/2, rect.height/2);

	var firstDiff = differenceFromAverage(wholeAverage, firstQuad);
	var secondDiff = differenceFromAverage(wholeAverage, secondQuad);
	var thirdDiff = differenceFromAverage(wholeAverage, thirdQuad);
	var fourthDiff = differenceFromAverage(wholeAverage, fourthQuad);

	RectScores.push(new Score(firstDiff, quads[0]));
	RectScores.push(new Score(secondDiff, quads[1]));
	RectScores.push(new Score(thirdDiff, quads[2]));
	RectScores.push(new Score(fourthDiff, quads[3]));
}

drawTargetImage();

// web workers?
// one big call to get the image data, then workers to break it up?
// build the average colors from bottom up, or as needed?
// to start, lets just go top down and average as needed