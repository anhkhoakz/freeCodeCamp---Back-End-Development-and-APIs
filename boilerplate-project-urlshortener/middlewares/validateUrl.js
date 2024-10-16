const validateUrl = (req, res, next) => {
    const url = req.body.url;
    const urlRegex =
        /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;

    if (!urlRegex.test(url)) {
        return res.json({ error: "invalid url" });
    }

    next();
};

module.exports = validateUrl;
