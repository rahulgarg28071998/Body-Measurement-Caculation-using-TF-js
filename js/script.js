(function() {

    var width = 720; // We will scale the photo width to this
    var height = 0; // This will be computed based on the input stream

    var streaming = false;

    var video = null;
    var canvas = null;
    var photo = null;
    var startbutton = null;

    function startup() {
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
        var context = canvas.getContext('2d');
        if (width && height) {
            canvas.width = width;
            canvas.height = height;
            context.drawImage(video, 0, 0, width, height);

            var data = canvas.toDataURL('image/png');
            photo.setAttribute('src', data);
            console.log(photo);
            const img = document.getElementById('photo');
            const net = await bodyPix.load();

            const partSegmentation = await net.segmentPersonParts(img);
            const coloredPartImage = bodyPix.toColoredPartMask(partSegmentation);
            const opacity = 0.7;
            const flipHorizontal = false;
            const maskBlurAmount = 0;
            const pixelCellWidth = 10.0;
            const canvas1 = document.getElementById('myCanvas');
            bodyPix.drawPixelatedMask(
                canvas1, img, coloredPartImage, opacity, maskBlurAmount,
                flipHorizontal, pixelCellWidth);

        } else {
            clearphoto();
        }
    }
    // body segmentaion code
    // const img = document.getElementById('photo');
    // const net = await bodyPix.load();
    // const segmentation = await net.segmentPerson(img);
    // console.log(segmentation);
    window.addEventListener('load', startup, false);
})();