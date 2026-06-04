const User = require("../models/User");

const adjustSpPoints = async (userId, delta) => {
  if (!userId || !delta) {
    return;
  }

  await User.findByIdAndUpdate(userId, {
    $inc: { spPoints: delta },
  });
};

module.exports = {
  adjustSpPoints,
};
