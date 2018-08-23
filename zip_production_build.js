const fs = require('fs');
const path = require('path')

const manifestPath = path.join(__dirname, 'extension', 'manifest.json');

const oldManifest = fs.readFileSync(manifestPath, {
  encoding: 'utf-8'
});

const oldManifestObj = JSON.parse(oldManifest)
const newManifestObj = {
  ...oldManifestObj,
  storage: {
    ...oldManifestObj.storage,
    hasBrainSiteUrl: "http://pin.hasbrain.com",
    apiBaseUrl: "https://contentkit-api-staging-us.mstage.io/graphql",
    apiToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwcm9qZWN0SWQiOiI1YWRmNzRjNzdmZjQ0ZTAwMWViODI1MzkiLCJpYXQiOjE1MjQ1OTM4NjN9.Yx-17tVN1hupJeVa1sknrUKmxawuG5rx3cr8xZc7EyY",
    userkitBaseUrl: "https://userkit-identity.mstage.io/v1"
  }
}

const newManifest = JSON.stringify(newManifestObj, null, '\t');
fs.writeFileSync(manifestPath, newManifest);
const { exec } = require('child_process');
exec('zip -r extension.zip extension', (err, stdout, stderr) => {
  if (err) {
    console.log('ERROR', err)
    return;
  }
  console.log('SUCCESS');
  fs.writeFileSync(manifestPath, oldManifest);
});
