const jwt = require("jsonwebtoken");
const { GraphQLError } = require("graphql");

// Set token secret and expiration date
const secret = "superdupersecrettimesbro";
const expiration = "2h";

module.exports = {
  // Custom authentication error for GraphQL
  AuthenticationError: new GraphQLError("Could not authenticate user.", {
    extensions: {
      code: "UNAUTHENTICATED",
    },
  }),

  // Middleware for authenticated routes
  authMiddleware: function (req, res, next) {
    // Allow token to be sent via req.query or headers
    let token = req.query.token || req.headers.authorization;

    // ["Bearer", "<tokenvalue>"]
    if (req.headers.authorization) {
      token = token.split(" ").pop().trim();
    }

    if (!token) {
      return next();
    }

    // Verify token and get user data out of it
    try {
      const { data } = jwt.verify(token, secret, { maxAge: expiration });
      req.user = data;
    } catch (err) {
      console.log("Invalid token");
      return res.status(401).json({ message: "Invalid token" });
    }

    next();
  },

  // Function to sign a token
  signToken: function ({ username, email, _id }) {
    const payload = { username, email, _id };
    return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
  },
};
