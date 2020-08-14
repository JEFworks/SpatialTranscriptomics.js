# SpatialTranscriptomics.js

## File Information
Currently, the application reads files stored in various subdirectories in the `data` directory. Make sure to `gunzip -k FILENAME` all .gz files. 

To specify which dataset you want the application to load, edit the following line in the `backend/Filereader.js` file.

```
const fileNum = 0; // 0 is filtered coronal brain, 1 is unfiltered coronal brain, 2 is olfactory bulb
```

## Running the App

You’ll need to have <b>Node and npm</b> installed on your local development machine.

To run the <b>client-side app</b>, do the following. You can skip `npm install` if you have already downloaded the packages for the client-side app.

```
cd client
npm install
npm start
```

Open http://localhost:3000 to view it in the browser. The page will automatically reload if you make changes to the client-side code. You will see the build errors and lint warnings in the console.

You'll also need to run the <b>backend server</b>, which runs on PORT 4000. In a separate terminal session, do the following. You can skip `npm install` if you have already downloaded the packages for the backend.

```
cd backend
npm install
npm start
```

If you make changes to the backend code, you will need to restart the backend server for your changes to take effect.
