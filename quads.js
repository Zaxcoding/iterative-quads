var RawPixelData;

function drawTargetImage() {
	var canvas = document.getElementById('targetImg');
	var context = canvas.getContext("2d");
	var srcImg = new Image();
	srcImg.src = "target.jpg";
	srcImg.onload = function() {
		context.drawImage(srcImg, 0, 0, 480, 640);
		getPixelData();
	}
}

function getPixelData() {
	var canvas = document.getElementById('targetImg');
	var context = canvas.getContext("2d");
	RawPixelData = context.getImageData(0, 0, canvas.width, canvas.height).data;
	iterate(context, 0, 0, canvas.width, canvas.height);
}

function averageColorOfRect(ctx, startX, startY, width, height) {
	var r = 0, g = 0, b = 0;

	var newPixelData = ctx.getImageData(startX, startY, width, height).data;
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

function iterate(ctx, startX, startY, width, height) {
	// find the average color of the full rect and each quadrant
	var wholeAverage = averageColorOfRect(ctx, startX, startY, width, height);
	var firstQuad = averageColorOfRect(ctx, startX, startY, width/2, height/2);
	var secondQuad = averageColorOfRect(ctx, startX + width/2, startY, width/2, height/2);
	var thirdQuad = averageColorOfRect(ctx, startX, startY + height/2, width/2, height/2);
	var fourthQuad = averageColorOfRect(ctx, startX + width/2, startY + height/2, width/2, height/2);

	console.log("firstdiff", differenceFromAverage(wholeAverage, firstQuad));
	console.log("seconddiff", differenceFromAverage(wholeAverage, secondQuad));
	console.log("thirddiff", differenceFromAverage(wholeAverage, thirdQuad));
	console.log("fourthdiff", differenceFromAverage(wholeAverage, fourthQuad));
}

drawTargetImage();

// web workers?
// one big call to get the image data, then workers to break it up?
// build the average colors from bottom up, or as needed?
// to start, lets just go top down and average as needed