const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

const errorHandler = (err, req, res, next) => {
    console.error("DEBUGGER - Error Stack:", err.stack);
    res.status(500).json({
        success: false,
        error: err.message,
        tip: "Check if all imports in the controller are correct."
    });
};

module.exports = { notFound, errorHandler };
