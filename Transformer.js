const paths = require('node:path');

class Transformer {
  constructor(reg) {
    this.registry = reg;
  }

  lookupTransformer(input) {
    const mime = require('mime-types');

    let type = mime.lookup(input);
    if (!type) type = paths.extname(input);

    if (type) {
      let name = this.registry[type.toLowerCase()];
      if (name) {
        try {
          let transform = require('./transformers/'+name).transform;
          return transform;
        }
        catch(ex) {
          console.log('unable to load transformer '+name+' for '+type);
          console.error(ex);
          return null;
        }
      }
      else {
        console.log('unknown handler for '+type);
        return null;
      }
    }
    else {
      console.log('unknown mime for '+input);
      return null;
    }
  }

  async transformInput(input) {
    let self = this;
    return new Promise((done, error) => {
      let transform = self.lookupTransformer(input);
        
      if (transform) {
        try {
          transform(input, function(output) {
            done(output);
          });
        }
        catch(ex) {
          console.log(ex);
          done();
        }
      }
      else {
        console.log('unable to find transformer for '+input);
        done(null);
      }
    });
  }
}

module.exports = Transformer;
