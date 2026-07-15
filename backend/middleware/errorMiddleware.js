// 404 handler — runs when no route matched the request
const notFound = (req, res, next) => {
  res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

// Centralized error handler — final safety net
const errorHandler = (err, req, res, next) => {
  console.error(err);
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({ message: err.message || "Server Error" });
};

module.exports = { notFound, errorHandler };