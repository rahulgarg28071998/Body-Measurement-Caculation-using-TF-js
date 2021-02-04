const webcamElement = document.getElementById('video');
const webcam = new Webcam(webcamElement, 'user');
const canvasPerson = document.getElementById("myCanvas4");
const contextPerson = canvasPerson.getContext("2d");
const multiplier = 0.75;
const outputStride = 16;
const segmentationThreshold = 0.5;
const backgrounds = ["greatwall", "pyramid", "Colosseum", "monchu", "ayers-rock", "taj", "easter-island", "moon"];

let net;
let cameraFrame;
let currentBGIndex = 0;
let screenMode;

function startDetectBody() {
    webcam.stream()
        .then(result => {
            if (net == null) {

                bodyPix.load({
                        // architecture: 'MobileNetV1',
                        // outputStride: outputStride,
                        // multiplier: multiplier,
                        // quantBytes: 2
                    })
                    .catch(error => {
                        console.log(error);
                    })
                    .then(objNet => {

                        net = objNet;
                        $("#canvasPerson").removeClass("d-none");
                        cameraFrame = detectBody();
                    });
            } else {
                $("#canvasPerson").removeClass("d-none");
            }
        })
        .catch(err => {
            displayError();
        });
}

function detectBody() {
    net.segmentPerson(webcamElement, {
            flipHorizontal: false,
            internalResolution: 'medium',
            segmentationThreshold: segmentationThreshold
        })
        .catch(error => {
            console.log(error);
        })
        .then(personSegmentation => {
            if (personSegmentation != null) {
                drawBody(personSegmentation);
            }
        });
    cameraFrame = requestAnimFrame(detectBody);
}

function drawBody(personSegmentation) {
    if (screenMode == 'l') {
        var canvas = document.createElement('canvas');
        canvas.width = webcamElement.width;
        canvas.height = webcamElement.height;
        var context = canvas.getContext('2d');
        context.drawImage(webcamElement, 0, 0);
        var imageData = context.getImageData(0, 0, webcamElement.width, webcamElement.height);

        var pixel = imageData.data;
        for (var p = 0; p < pixel.length; p += 4) {
            if (personSegmentation.data[p / 4] == 0) {
                pixel[p + 3] = 0;
            }
        }
        context.imageSmoothingEnabled = true;
        context.putImageData(imageData, 0, 0);

        var imageObject = new Image();
        imageObject.onload = function() {
            contextPerson.clearRect(0, 0, canvasPerson.width, canvasPerson.height);
            contextPerson.imageSmoothingEnabled = true;
            contextPerson.drawImage(imageObject, 0, 0, canvasPerson.width, canvasPerson.height);
        }
        imageObject.src = canvas.toDataURL();
    } else {
        contextPerson.drawImage(webcamElement, 0, 0, webcamElement.width, webcamElement.height);
        var imageData = contextPerson.getImageData(0, 0, webcamElement.width, webcamElement.height);
        var pixel = imageData.data;
        for (var p = 0; p < pixel.length; p += 4) {
            if (personSegmentation.data[p / 4] == 0) {
                pixel[p + 3] = 0;
            }
        }
        contextPerson.imageSmoothingEnabled = true;
        contextPerson.putImageData(imageData, 0, 0);
    }
}

startDetectBody();