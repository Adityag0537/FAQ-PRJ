const getBadgeLevel = (spPoints = 0) => {
  if (spPoints >= 501) {
    return "Mentor";
  }

  if (spPoints >= 201) {
    return "Expert";
  }

  if (spPoints >= 51) {
    return "Helper";
  }

  return "Beginner";
};

module.exports = {
  getBadgeLevel,
};
