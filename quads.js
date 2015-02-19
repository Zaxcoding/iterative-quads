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
	

	setTimeout(function() {
		iterate(context, 0, 0, canvas.width/2, canvas.height/2);
	}, 100);

	setTimeout(function() {
		iterate(context, canvas.width/2, 0, canvas.width/2, canvas.height/2);
	}, 100);
	
	setTimeout(function() {
		iterate(context, 0, canvas.height/2, canvas.width/2, canvas.height/2);
	}, 100);
	
	setTimeout(function() {
		iterate(context, canvas.width/2, canvas.height/2, canvas.width/2, canvas.height/2);
	}, 100);
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

	var canvas = document.getElementById('targetImg');
	var context = canvas.getContext("2d");
	context.fillStyle = firstQuad[0].toString(16)  + firstQuad[1].toString(16) + firstQuad[2].toString(16);
	context.fillRect(startX, startY, width/2, height/2);

	console.log(firstQuad[0].toString(16)  + firstQuad[1].toString(16) + firstQuad[2].toString(16));

	context.fillStyle = secondQuad[0].toString(16)  + secondQuad[1].toString(16) + secondQuad[2].toString(16);
	context.fillRect(startX + width/2, startY, width/2, height/2);

	context.fillStyle = thirdQuad[0].toString(16)  + thirdQuad[1].toString(16) + thirdQuad[2].toString(16);
	context.fillRect(startX, startY + height/2, width/2, height/2);

	context.fillStyle = fourthQuad[0].toString(16)  + fourthQuad[1].toString(16) + fourthQuad[2].toString(16);
	context.fillRect(startX + width/2, startY + height/2, width/2, height/2);

	var firstDiff = differenceFromAverage(wholeAverage, firstQuad);
	var secondDiff = differenceFromAverage(wholeAverage, secondQuad);
	var thirdDiff = differenceFromAverage(wholeAverage, thirdQuad);
	var fourthDiff = differenceFromAverage(wholeAverage, fourthQuad);

	var max = Math.max(firstDiff, secondDiff, thirdDiff, fourthDiff);

	if (max == firstDiff) {
		iterate(ctx, startX, startY, width/2, height/2);
	}
	else if (max == secondDiff) {
		iterate(ctx, startX + width/2, startY, width/2, height/2);
	}
	else if (max == thirdDiff) {
		iterate(startX, startY + height/2, width/2, height/2);
	}
	else if (max == fourthDiff) {
		iterate(ctx, startX + width/2, startY + height/2, width/2, height/2);
	}

}

drawTargetImage();

// web workers?
// one big call to get the image data, then workers to break it up?
// build the average colors from bottom up, or as needed?
// to start, lets just go top down and average as needed