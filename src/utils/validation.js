const validator = require("validator");

const validateUserData = (req) => {
  const { firstName, lastName } = req.body;
  console.log("reaching");
  if (!firstName || !lastName) throw new Error("Invalid firstName or lastName");
};

const validateProfileEditData = (userData) => {
  const ALLOWED_UPDATES = ["about", "gender", "age", "skills", "photoUrl"];
  const isUpdateAllowed = Object.keys(userData).every((key) =>
    ALLOWED_UPDATES.includes(key)
  );

  return isUpdateAllowed;
};

module.exports = { validateUserData, validateProfileEditData };
