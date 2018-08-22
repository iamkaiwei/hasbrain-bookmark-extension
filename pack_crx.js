const ChromeExtension = require('crx');
const fs = require('fs');
const path = require('path');

const extensionPath = path.join(__dirname, 'extension')
const extensionPemPath =  path.join(__dirname, 'extension.pem')

const crx = new ChromeExtension({
  privateKey: fs.readFileSync(extensionPemPath),
});

crx.load(extensionPath)
.then(crx => crx.pack())
.then(crxBuffer => {
  console.log('SUCCESS');
  fs.writeFileSync('./extension.crx', crxBuffer);
})
.catch(err => console.log(err));
