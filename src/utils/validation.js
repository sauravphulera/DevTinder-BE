const validator = require("validator");

const validateUserData = (req) => {
  const { firstName, lastName } = req.body;
  console.log("reaching");
  if (!firstName || !lastName) throw new Error("Invalid firstName or lastName");
};

module.exports = validateUserData;
