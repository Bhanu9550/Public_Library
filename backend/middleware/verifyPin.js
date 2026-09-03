const verifyPin = (req, res, next) => {
    const { pin } = req.body;
    if (pin === process.env.LIBRARY_ADMIN_PIN) {
        next();
    } else {
        res.status(401).json({ error: "Unauthorized" });
    }
};

module.exports = { verifyPin };