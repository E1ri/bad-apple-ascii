const sharp = require("sharp");
const ffmpeg = require("ffmpeg");

const newPixelArray = [];
const range = [".", ",", ":", ";", "+", "*", "?", "%", "S", "#", "@"];
const badAppleFile = new ffmpeg("input/badapple.mp4");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function get(m) {
  const image = sharp(`output/_${m}.jpg`);
  const meta = await image.metadata();
  const grayBuff = await image
    .resize(Math.round(meta.width / 6))
    .gamma()
    .grayscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  return grayBuff;
}

function process(grayBuff, m) {
  newPixelArray.push([]);
  const { data, info } = grayBuff;
  const pixelArray = new Uint8ClampedArray(data.buffer);
  const width = info.width;

  for (let x = 0; x < pixelArray.length; x++) {
    newPixelArray[m - 1].push(
      range[Math.round((pixelArray[x] / 255) * 10)] + " "
    );
    if (x % width === 0) {
      newPixelArray[m - 1].push("\n");
    }
  }
}

async function print() {
  try {
    for (let m = 1; m <= 6572; m++) {
      const response = await get(m);
      process(response, m);
    }
    let y = 0;
    setInterval(async () => {
      if (y !== newPixelArray.length) {
        console.log(newPixelArray[y].join(""));
        y++;
        await sleep(1000 / 48);
        console.clear();
      } else {
        console.log("done");
      }
    }, 1000 / 48);
  } catch (err) {
    console.log(err);
  }
}

function start() {
  badAppleFile.then((video) => {
    video.fnExtractFrameToJPG(
      "output/",
      {
        file_name: "",
      },
      () => {
        console.log("Frame extraction is over! Wait a little more please! :(");
        print();
      }
    );
  });
}

start();
