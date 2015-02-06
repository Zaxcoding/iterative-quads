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
}

drawTargetImage();