const sharp = require('sharp');
const clustering = require('density-clustering');

module.exports = {
  path: '/image-mean',
  info: 'Means the pixels of an image into clusters',
  type: 'post',
  params: [
    {
      name: 'clusters',
      required: false,
      default: '5'
    }
  ],
  category: 'image',

  async execute(req, res) {
    if (!req.body || !req.body.length) {
      res.error('You must pass a image in the request body');
      return;
    }
    let clusterNumber = Number(req.query['clusters']??5);
    if (clusterNumber<2) {
      res.error('You need atleast 2 clusters');
      return;
    }
    if (clusterNumber>10) {
      res.error('Too many clusters (max 10)');
      return;
    }

    let { data, info } = await sharp(req.body)
      .raw()
      .toBuffer({ resolveWithObject: true })
      .catch(() => {
        res.error('Could not parse', 500);
        return {data:false,info:{}};
      });
    if (!data) return;

    let { width, height, channels } = info;

    // Get all pixels
    let pixels = [];
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let idx = (y * width + x) * channels;
        pixels.push([
          data[idx],
          data[idx+1],
          data[idx+2]
        ]);
      }
    }

    // Kmeans calculations
    const kmeans = new clustering.KMEANS();
    let clusters = [];
    try {
      clusters = kmeans.run(pixels, clusterNumber);
    } catch(err) {
      res.error('Could not mean image', 500);
    }

    // Gets mean color of each cluster
    // and assigns a each pixel to a cluster
    const centroids = [];
    const pixelClusterMap = new Array(pixels.length).fill(-1);
    clusters.forEach((arr, idx) => {
      let sr = 0, sg = 0, sb = 0;
      arr.forEach((i) => {
        pixelClusterMap[i] = idx;
        sr += pixels[i][0];
        sg += pixels[i][1];
        sb += pixels[i][2];
      });
      const count = arr.length;
      centroids[idx] = [
        Math.round(sr / count),
        Math.round(sg / count),
        Math.round(sb / count)
      ];
    });

    // New image data
    // Creates new buffer with the new image data using the colors from previous clustering
    const newBuffer = Buffer.alloc(data.length);
    for (let i = 0; i < pixels.length; i++) {
      let idx = i * channels;
      let clusterIdx = pixelClusterMap[i];
      let [r, g, b] = centroids[clusterIdx];
      newBuffer[idx] = r;
      newBuffer[idx+1] = g;
      newBuffer[idx+2] = b;
      if (channels === 4) newBuffer[idx+3] = data[idx+3];
    }

    // Create new image and send
    await sharp(newBuffer, {
      raw: { width, height, channels }
    })
      .png()
      .toBuffer()
      .then(outputBuffer => {
        res.json({
          image: 'data:image/png;base64,' + outputBuffer.toString('base64')
        })
      })
      .catch(() => {
        res.error('Could not generate', 500);
        return;
      });
  }
}