const sharp = require('sharp');
const ffmpeg = require('ffmpeg');

const newPixelArray = [];
const range = ['.', ',', ':', ';', '+', '*', '?', '%', 'S', '#', '@'];
const badAppleFile = new ffmpeg('input/badapple.mp4');


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function process() {
    for (let m = 1; m <= 6572; m++) {
    newPixelArray.push([]);
        const image = sharp(`output/_${m}.jpg`);
        image
            .metadata()
            .then(metadata => {
                return image
                    .resize(Math.round(metadata.width / 6))
                    .gamma()
                    .grayscale()
                    .raw()
                    .toBuffer({ resolveWithObject: true })
            })
            .then(({ data, info }) => {
                const pixelArray = new Uint8ClampedArray(data.buffer);
                const width = info.width;

                for (let x = 0; x < pixelArray.length; x++) {
                    newPixelArray[m].push(range[Math.round(pixelArray[x] / 255 * 10)] + ' ');
                    if (x % width === 0) {
                        newPixelArray[m].push('\n');
                    }
                }
            })
    }
}

badAppleFile.then(video => {
    video.fnExtractFrameToJPG('output/', {
        file_name: ''
    })
    .then(() => {
        process();
    })    
    .then(() => {
        let y = 0;
        setInterval(async () => {
            if (y !== newPixelArray.length) {
                console.log(newPixelArray[y].join(''))
                y++;
                await sleep(1000 / 48);
                console.clear();
            }
            else {
                console.log('done');
            }
        }, 1000 / 48);
    })

})