const video = document.getElementById('video');
const URL = '/models';

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
    faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
    faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
    faceapi.nets.faceExpressionNet.loadFromUri("/models"),
    faceapi.nets.ageGenderNet.loadFromUri('/models')
  ]).then(startVideo());

function startVideo(){
    return false;
    navigator.getUserMedia({
        video:{}
    }, stream => (video.srcObject = stream), err => console.log(err));
}

video.addEventListener('play', () => {
    const canvas = faceapi.createCanvasFromMedia(video);
    document.body.append(canvas);

    const boxSize = {
        width:video.width,
        height:video.height
    };

    faceapi.matchDimensions(canvas, boxSize);
    
    setInterval(async () => {
        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions()
        .withAgeAndGender();

        const resizedDetections = faceapi.resizeResults(detections, boxSize);
        canvas.getContext('2d').clearRect(0,0, canvas.width, canvas.height);

        faceapi.draw.drawDetections(canvas,resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvas,resizedDetections);
        faceapi.draw.drawFaceExpressions(canvas,resizedDetections);
        resizedDetections.forEach(result => {
            const { age, gender, genderProbability } = result;
            let roundAge = Math.round(age);
            let roundGender = Math.round(genderProbability);
            new faceapi.draw.DrawTextField(
                [
                    `${roundAge} years`,
                    `${gender} (${roundGender})`
                ],
                result.detection.box.bottomRight
                ).draw(canvas);
        });

    },100);
})
