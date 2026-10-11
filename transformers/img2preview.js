function transform(input, dest, done) {
  const sharp = require('sharp');
  const output = dest+'/thumbnail.png';
  
  sharp(input)
  .autoOrient()
  .resize({ width:512, width:512 })
  .toFile(output, function() {
    done([output]);
  });
}

module.exports.transform = transform;
