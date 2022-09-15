exports.getDate = () => {
  const date = new Date();

  // This is a javascript object that we can use to format our date just the way we want to.
  const options = {
    weekday: "long",
    day: "2-digit",
    month: "long",
  };

  return date.toLocaleDateString("en-US", options);
};

exports.getDay = () => {
  const date = new Date();

  // This is a javascript object that we can use to format our date just the way we want to.
  var options = {
    weekday: "long",
  };

  return date.toLocaleDateString("en-US", options);
};
