const { getBadgeLevel } = require("./badges");

const formatUserResponse = (user) => {
  if (!user) {
    return null;
  }

  const obj = user.toObject ? user.toObject() : { ...user };

  return {
    _id: obj._id,
    name: obj.name,
    email: obj.email,
    role: obj.role || "USER",
    spPoints: obj.spPoints || 0,
    badge: getBadgeLevel(obj.spPoints || 0),
    isSuspended: Boolean(obj.isSuspended),
  };
};

module.exports = {
  formatUserResponse,
};
