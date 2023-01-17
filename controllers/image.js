// const { ClarifaiStub, grpc } = require('clarifai-nodejs-grpc');
import * as clarifai from 'clarifai-nodejs-grpc';
const { ClarifaiStub, grpc } = clarifai;

// const apiKey = process.env.CLARIFAI_API;
// const app = new Clarifai.App({
//   apiKey: apiKey,
// });

// const handleApiCall = (req, res) => {
//   app.models
//     .predict(
//       // HEADS UP! Sometimes the Clarifai Models can be down or not working as they are constantly getting updated.
//       // A good way to check if the model you are using is up, is to check them on the clarifai website. For example,
//       // for the Face Detect Mode: https://www.clarifai.com/models/face-detection
//       // If that isn't working, then that means you will have to wait until their servers are back up. Another solution
//       // is to use a different version of their model that works like: `c0c0ac362b03416da06ab3fa36fb58e3`
//       // so you would change from:
//       // .predict(Clarifai.FACE_DETECT_MODEL, this.state.input)
//       // to:
//       // .predict('c0c0ac362b03416da06ab3fa36fb58e3', this.state.input)
//       // "53e1df302c079b3db8a0a36033ed2d15",
//       // '6dc7e46bc9124c5c8824be4822abe105',
//       // '2ba4d0b0e53043f38dbbed49e03917b6',
//       Clarifai.FACE_DETECT_MODEL,
//       req.body.input
//     )
//     .then((data) => {
//       res.json(data);
//     })
//     .catch((err) => res.status(404).json("unable to work with API"));
// };

const handleApiCall = (req, res) => {
  const USER_ID = process.env.CLARIFAI_USER_ID;
  // Your PAT (Personal Access Token) can be found in the portal under Authentification
  const PAT = process.env.CLARIFAI_PAT;
  const APP_ID = process.env.CLARIFAI_APP_ID;
  // Change these to make your own predictions
  const MODEL_ID = process.env.CLARIFAI_MODEL_ID;
  // const MODEL_VERSION = process.env.CLARIFAI_MODEL_VERSION; // This is optional. Defaults to the latest model version
  const IMAGE_URL = req.body.url;

  const stub = ClarifaiStub.grpc();

  // This will be used by every Clarifai endpoint call
  const metadata = new grpc.Metadata();
  metadata.set('authorization', 'Key ' + PAT);

  stub.PostModelOutputs(
    {
      user_app_id: {
        user_id: USER_ID,
        app_id: APP_ID,
      },
      model_id: MODEL_ID,
      // version_id: MODEL_VERSION, // This is optional. Defaults to the latest model version
      inputs: [{ data: { image: { url: IMAGE_URL } } }],
    },
    metadata,
    (err, response) => {
      if (err) {
        throw new Error(err);
      }

      if (response.status.code !== 10000) {
        throw new Error(
          'Post model outputs failed, status: ' + response.status.description
        );
      }
      res = res.json(response);
    }
  );
};

const handleImage = (req, res, db) => {
  const { id } = req.body;
  db('users')
    .where('id', '=', id)
    .increment('entries', 1)
    .returning('entries')
    .then((entries) => {
      res.json(entries[0]);
    })
    .catch((err) => res.status(400).json('unable to get entries'));
};

export { handleImage, handleApiCall };
