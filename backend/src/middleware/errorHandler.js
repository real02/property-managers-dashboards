function errorHandler(err, req, res, next) {
  console.error("Error occurred: ", err);

  if (err.name === "ValidationError") {
    return res.status(400).json({
      status: "error",
      message: "Validation failed",
      errors: err.details,
    });
  }

  if (err.message === "UnauthorizedError" || err.name === "Unauthorized") {
    return res.status(403).json({
      status: "error",
      message: "Access Forbidden",
      errors: err.details,
    });
  }

  if (err.code === "SQLITE_CONSTRAINT") {
    return res.status(400).json({
      status: "error",
      message: "Data constraint violation",
    });
  }

  res.status(500).json({
    status: "error",
    message:
      process.env.NODE_ENV === "production"
        ? "Interval server error"
        : err.message,
  });
}

module.exports = errorHandler;
