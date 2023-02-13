module.exports = function (err, req, res, next) {
    if (err.name === "UnauthorizedError") {
        res.status(401).send({ error: err.name + ": " + err.message });
    } else if (err) {
        res.status(400).send({ error: err.name + ": " + err.message });
        console.log(err);
    }
}