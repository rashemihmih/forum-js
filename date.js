function getFormattedDate() {
    let date = new Date();
    let year = date.getFullYear();
    let month = formatWithPadding(date.getMonth() + 1);
    let day = formatWithPadding(date.getDate());
    let hours = formatWithPadding(date.getHours());
    let minutes = formatWithPadding(date.getMinutes());
    let seconds = formatWithPadding(date.getSeconds());
    return year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds;
}

function formatWithPadding(number) {
    return number > 9 ? '' + number : '0' + number;
}

module.exports.getFormattedDate = getFormattedDate;