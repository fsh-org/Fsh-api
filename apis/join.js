/* This file is a big mess */

const Jimp = require('jimp');
const sharp = require('sharp')
const fs = require('fs');
let path = require('path')
const stream = require('stream');
let nanoid;

// get packages that use import bc boooooo
(async()=>{
  const nanid = await import('nanoid');
  nanoid = nanid.nanoid
})();

function getImg(imageUrl, outputPath) {
  return new Promise((resolve, reject) => {
    fetch(imageUrl)
      .then((response) => {
        if (!response.ok) {
          reject(`HTTP error! Status: ${response.status}`);
        }
        const dest = fs.createWriteStream(outputPath);
        const pipeline = stream.pipeline(response.body, dest, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      })
      .catch((error) => {
        reject(error)
      });
  })
}

module.exports = {
  path: '/join',
  info: 'info',
  type: 'get',
  params: ["h", true],
  category: "hidden",
  
  async execute(req, res) {
    let image1Path, image2Path;
    try {
      image1Path = `images/join/get/${nanoid()}.jpeg`;
      await getImg(req.query['one'], image1Path);

      image2Path = `images/join/get/${nanoid()}.jpeg`;
      await getImg(req.query['two'], image2Path);
    } catch (err) {
      res.status(500);
      res.send('{"err": true, "msg": "Error getting images"}');
      return;
    }

    const outputPath = `images/join/final/${nanoid()}.png`;

      Promise.all([sharp(image1Path), sharp(image2Path)])
      .then(images => {
        return Promise.all(images.map(image => image.metadata()));
      })
      .then(metadata => {
        const hig = metadata[0].height / metadata[1].height;

        return Promise.all([
          sharp(image1Path).resize({ height: metadata[1].height * hig }),
          sharp(image2Path).resize({ height: metadata[1].height * hig })
        ]);
      })
      .then(images => {
        const [resizedImage1, resizedImage2] = images;

        const outputWidth = resizedImage1.width + resizedImage2.width + 10;
        const outputHeight = Math.max(resizedImage1.height, resizedImage2.height);

        return sharp({
          create: {
            width: outputWidth,
            height: outputHeight,
            channels: 4, // for RGBA
            background: { r: 255, g: 255, b: 255, alpha: 1 }
          }
        })
          .composite([
            { input: resizedImage1, top: 0, left: 0 },
            { input: resizedImage2, top: 0, left: resizedImage1.width + 10 }
          ])
          .png()
          .toFile(outputPath);
      })
      .then(() => res.send(`{"image": "https://api.fsh.plus/${outputPath}"}`))
      .catch(err => {
        console.log(err)
        res.status(500);
        res.send('{"err": true, "msg": "Error combining"}');
      });
    /*
    let image1Path,image2Path;
try {
image1Path = `images/join/get/${nanoid()}.jpeg`;
await getImg(req.query['one'], image1Path)
    
image2Path = `images/join/get/${nanoid()}.jpeg`;
await getImg(req.query['two'], image2Path)
} catch (err) {
  //console.log(err)
  res.status(500)
  res.send('{"err": true, "msg": "Error getting images"}');
  return;
}
    
const outputPath = `images/join/final/${nanoid()}.png`;
    
Promise.all([Jimp.read(image1Path), Jimp.read(image2Path)])
  .then(images => {
    let hig = images[0].bitmap.height/images[1].bitmap.height;

    //images[0].resize(images[0].bitmap.width*hig, images[0].bitmap.height*hig)
    images[1].resize(images[1].bitmap.width*hig, images[1].bitmap.height*hig)
    
    const mergedImage = new Jimp(images[0].bitmap.width + images[1].bitmap.width+10, images[0].bitmap.height)
      .background(0xFFFFFFff);

    mergedImage.blit(images[0], 0, 0);
    mergedImage.blit(images[1], images[0].bitmap.width+10, 0);

    return mergedImage.writeAsync(outputPath);
  })
  .then(() => res.send(`{"image": "https://api.fsh.plus/${outputPath}"}`))
  .catch(err => {
    //console.log(err)
    res.status(500)
    res.send('{"err": true, "msg": "Error combining"}')
  });
*/
  }
}