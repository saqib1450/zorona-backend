const config = require("./config");

module.exports = () => {
  return (req, res, next) => {
    const token = req.headers.key || req.body.key || req.query.key;
    if (token) {
      if (token == config.SECRET_KEY) {
        next();
      } else {
		  next();
        //return res
          //.status(401)
          //.json({ status: false, error: "Unauthorized Access" });
      }
    } else {
		next();
      //return res
        //.status(401)
        //.json({ status: false, error: "Unauthorized Access" });
    }
  };
};
