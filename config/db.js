const url = process.env.MONGODB_URI;

module.exports = {
    url: url,
    name: url.substring(url.lastIndexOf('/') + 1)
};