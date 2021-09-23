function forceUnsafeHTTP() {
    return (req, res, next) => {
        req.headers["x-forwarded-proto"] === "https"
        ? res.redirect("http://" + req.hostname + req.originalUrl)
        : next();
    };
}

module.exports = forceUnsafeHTTP;
