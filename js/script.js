(function() {

    var width = 720; // We will scale the photo width to this
    var height = 0; // This will be computed based on the input stream

    var streaming = false;

    var video = null;
    var canvas = null;
    var photo = null;
    var startbutton = null;

    async function startup() {
        video = document.getElementById('video');
        canvas = document.getElementById('canvas');
        photo = document.getElementById('photo');
        startbutton = document.getElementById('startbutton');



        navigator.mediaDevices.getUserMedia({
                video: true,
                audio: false
            })
            .then(function(stream) {
                video.srcObject = stream;
                video.play();
            })
            .catch(function(err) {
                console.log("An error occurred: " + err);
            });

        video.addEventListener('canplay', function(ev) {
            if (!streaming) {
                height = video.videoHeight / (video.videoWidth / width);

                if (isNaN(height)) {
                    height = width / (4 / 3);
                }

                video.setAttribute('width', width);
                video.setAttribute('height', height);
                canvas.setAttribute('width', width);
                canvas.setAttribute('height', height);
                streaming = true;
            }
        }, false);

        startbutton.addEventListener('click', function(ev) {
            takepicture();
            ev.preventDefault();
        }, false);

        clearphoto();
    }


    function clearphoto() {
        var context = canvas.getContext('2d');
        context.fillStyle = "#AAA";
        context.fillRect(0, 0, canvas.width, canvas.height);

        var data = canvas.toDataURL('image/png');
        photo.setAttribute('src', data);
    }

    async function takepicture() {

        var inputHeight = 178;
        var context = canvas.getContext('2d');
        if (width && height) {
            canvas.width = width;
            canvas.height = height;
            context.drawImage(video, 0, 0, width, height);

            var data = canvas.toDataURL('image/png');
            photo.setAttribute('src', data);
            // console.log(photo);
            let img = document.getElementById('photo');
            const net = await bodyPix.load();
            const partSegmentation = await net.segmentPersonParts(img);
            try {
                // console.log(partSegmentation.allPoses[0].keypoints);
                var poseCoordinates = partSegmentation.allPoses[0].keypoints;
                //0.93
                var leftEye = poseCoordinates[3]["position"];
                var rightEye = poseCoordinates[2]["position"];
                var leftShoulder = poseCoordinates[5]["position"];
                var rightShoulder = poseCoordinates[6]["position"];
                var leftElbow = poseCoordinates[7]["position"];
                var rightElbow = poseCoordinates[8]["position"];
                var leftWrist = poseCoordinates[9]["position"];
                var rightWrist = poseCoordinates[10]["position"];
                var leftHip = poseCoordinates[11]["position"];
                var rightHip = poseCoordinates[12]["position"];
                var leftKnee = poseCoordinates[13]["position"];
                var rightKnee = poseCoordinates[14]["position"];
                var leftAnkle = poseCoordinates[15]["position"];
                var rightAnkle = poseCoordinates[16]["position"];
                console.log(poseCoordinates);
                console.log(leftAnkle,rightAnkle)
                var heightPixel = Math.max((leftAnkle.y - leftShoulder.y), (rightAnkle.y - rightShoulder.y))
                
                // var heightPixel = Math.max(distance(leftAnkle.y, leftEye.y), distance(rightAnkle.y, rightEye.y))
                console.log("height " + heightPixel);

                heightPixel = 1.28 * heightPixel;
                var multiplier = inputHeight / heightPixel;
                var shoulder = distance(leftShoulder, rightShoulder);
                console.log("shoulder length " + multiplier * shoulder);

                var weist = distance(leftHip, rightHip);
                console.log("weist length " + multiplier * weist);

                var leftArm = distance(leftShoulder, leftElbow) + distance(leftElbow, leftWrist);
                console.log("left arm " + multiplier * leftArm);

                var rightArm = distance(rightShoulder, rightElbow) + distance(rightElbow, rightWrist);
                console.log("right arm " + multiplier * rightArm);

                var leftLeg = distance(leftHip, leftKnee) + distance(leftKnee, leftAnkle);
                console.log("left leg " + multiplier * leftLeg);

                var rightLeg = distance(rightHip, rightKnee) + distance(rightKnee, rightAnkle);
                console.log("right leg " + multiplier * rightLeg);
            } catch {
                console.log("datapoints not gathered");
            }

            const coloredPartImage = bodyPix.toColoredPartMask(partSegmentation);
            const opacity = 0.9;
            const flipHorizontal = false;
            const maskBlurAmount = 0;
            const pixelCellWidth = 10.0;
            const canvas1 = document.getElementById('myCanvas');
            bodyPix.drawPixelatedMask(
                canvas1, img, coloredPartImage, opacity, maskBlurAmount,
                flipHorizontal, pixelCellWidth);
            console.log(coloredPartImage)



            const segmentation = await net.segmentPerson(img);

            const backgroundBlurAmount = 10;
            const edgeBlurAmount = 3;


            const myCanvas2 = document.getElementById('myCanvas2');

            bodyPix.drawBokehEffect(
                myCanvas2, img, segmentation, backgroundBlurAmount,
                edgeBlurAmount, flipHorizontal);


        } else {
            clearphoto();
        }
    }


    function distance(point1, point2) {
        return Math.pow((Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2)), 0.5);
    }
    // body segmentaion code
    // const img = document.getElementById('photo');
    // const net = await bodyPix.load();
    // const segmentation = await net.segmentPerson(img);
    // console.log(segmentation);
    window.addEventListener('load', startup, false);
})();

function submitHeight() {
    let ele = document.getElementById('exampleInputEmail1').value
    document.getElementById('displayHeight').innerHTML  = ele + ' cms is the provided height'
}

// function getCoordinates(poses, bodyPart, confidence=0.9) {
//     let part = poses.map((p) => {
//         if(p.part==bodyPart)
//             return p
//     })
//     console.log(part)
//     return part
// }