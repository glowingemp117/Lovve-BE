const config = require('config');

const {jwtUtils} = require('../utils');

const {GeneralErrorsFactory} = require('../factories');

module.exports = (req, res, next) => {
  
  const header = req.header(config.get('tokenVariable'));
  const token = jwtUtils.verify(header);
  
  if (token) {
    req.user = token;
    next();
  } else {
    next(GeneralErrorsFactory.invalidTokenErr());
  }
};
