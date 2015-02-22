var targetImageCtx;
var workingImageCtxArray;
var RectScores;

var QuadsToStartOut = 4;
var TargetImage = "owl.jpg";
var DrawTimeout = 1;
var AreaImportance = .85;
var GridLines = false;

var quadrantRGB = [4];

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
	iterate(RectScores[n].shift().rect, n);

	setTimeout(function() { draw(n) }, DrawTimeout);
}

function drawTargetImage(target) {
	TargetImage = target;

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

	var rawPixelData = targetImageCtx.getImageData(0, 0, 480, 640).data;
	for (var i = 0; i < 4; i++) {
		quadrantRGB[i] = [];
		for (var j = 0; j < 240; j++) {
			quadrantRGB[i][j] = [];
			for (var k = 0; k < 320; k++) {
				quadrantRGB[i][j][k] = new Object();
			}
		}
	}

	for (var i = 0; i < 480; i++) {
		for (var j = 0; j < 640; j++) {
			if (i < 240 && j < 320) {
				quadrantRGB[0][i][j] = { r: rawPixelData[(j*480 + i)*4], g: rawPixelData[(j*480 + i)*4 + 1], b: rawPixelData[(j*480 + i)*4 + 2] };
			}
			if (i >= 240 && j < 320) {
				quadrantRGB[1][i-240][j] = { r: rawPixelData[(j*480 + i)*4], g: rawPixelData[(j*480 + i)*4 + 1], b: rawPixelData[(j*480 + i)*4 + 2] };
			}
			if (i < 240 && j >= 320) {
				quadrantRGB[2][i][j-320] = { r: rawPixelData[(j*480 + i)*4], g: rawPixelData[(j*480 + i)*4 + 1], b: rawPixelData[(j*480 + i)*4 + 2] };
			}
			if (i >= 240 && j >= 320) {
				quadrantRGB[3][i-240][j-320] = { r: rawPixelData[(j*480 + i)*4], g: rawPixelData[(j*480 + i)*4 + 1], b: rawPixelData[(j*480 + i)*4 + 2] };
			}
		}
	}
}

function locationOf(element, array, start, end) {
	if (array.length == 0) return 0;

  start = start || 0;
  end = end || array.length;
  var pivot = parseInt(start + (end - start) / 2, 10);
  if (array[pivot] === element) return pivot;
  if (end - start <= 1)
    return array[pivot].score > element.score ? pivot : pivot - 1;
  if (array[pivot].score < element.score) {
		return locationOf(element, array, start, pivot);
  } else {
		return locationOf(element, array, pivot, end);
  }
}

function insert(element, array) {
  array.splice(locationOf(element, array) + 1, 0, element);
  return array;
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

function averageUsingArray(rect, n) {
	var r = 0, g = 0, b = 0;

	if (rect.width < 1 || rect.height < 1) {
		return -Infinity;
	}

  var cnt = 0;
	var flooredStartX = Math.floor(rect.startX);
	var flooredStartY = Math.floor(rect.startY);

	var endX = flooredStartX + rect.width;
	var endY = flooredStartY + rect.height;

	for (var i = flooredStartX; i < endX; i++) {
		for (var j = flooredStartY; j < endY; j++) {
			r += quadrantRGB[n][i][j].r;
			g += quadrantRGB[n][i][j].g;
			b += quadrantRGB[n][i][j].b;
			cnt++;
		}
	}

	r /= cnt;
	g /= cnt;
	b /= cnt;

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
	var wholeAverage = averageUsingArray(rect, n);

	var quads = [new Rect(rect.startX, rect.startY, rect.width/2, rect.height/2), new Rect(rect.startX + rect.width/2, rect.startY, rect.width/2, rect.height/2), new Rect(rect.startX, rect.startY + rect.height/2, rect.width/2, rect.height/2), new Rect(rect.startX + rect.width/2, rect.startY + rect.height/2, rect.width/2, rect.height/2)];

	var quadAverages = [];
	var differences = [];
	for (var i = 0; i < 4; i++) {
		quadAverages[i] = averageUsingArray(quads[i], n);
		workingImageCtxArray[n].fillStyle = "#" + ("00" + Math.floor(quadAverages[i][0]).toString(16)).slice(-2)  + ("00" + Math.floor(quadAverages[i][1]).toString(16)).slice(-2) + ("00" + Math.floor(quadAverages[i][2]).toString(16)).slice(-2);
		if (GridLines)
			workingImageCtxArray[n].strokeRect(quads[i].startX, quads[i].startY, quads[i].width, quads[i].height);
		workingImageCtxArray[n].fillRect(quads[i].startX, quads[i].startY, quads[i].width, quads[i].height);
		differences[i] = differenceFromAverage(wholeAverage, quadAverages[i]);
		RectScores[n] = insert(new Score(differences[i] * Math.pow(rect.width*rect.height, AreaImportance) , quads[i]), RectScores[n]);
	}
}

function areaFactor(n) {
	AreaImportance = n;
	drawTargetImage(TargetImage);
}

function gridLines(n) {
	GridLines = n;
	drawTargetImage(TargetImage);
}

drawTargetImage(TargetImage);
