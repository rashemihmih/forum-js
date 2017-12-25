function response(code, content) {
    return {'code': code, 'content': content}
}

function ok(content) {
    if (content !== undefined) {
        return response(0, content)
    }
    return response(0, 'OK')
}

function incorrectRequest(content) {
    if (content !== undefined) {
        return response(1, content)
    }
    return response(1, 'Ошибка авторизации')
}

function authError(content) {
    if (content !== undefined) {
        return response(2, content)
    }
    return response(2, 'Ошибка авторизации')
}

function duplicateEntry(content) {
    if (content !== undefined) {
        return response(3, content)
    }
    return response(3, 'Запись уже существует')
}

function entryNotFound(content) {
    if (content !== undefined) {
        return response(4, content)
    }
    return response(4, 'Запись не найдена')
}

function dbError(content) {
    if (content !== undefined) {
        return response(3, content)
    }
    return response(8, 'Ошибка при работе с базой данных')
}

module.exports.ok = ok;
module.exports.incorrectRequest = incorrectRequest;
module.exports.authError = authError;
module.exports.duplicateEntry = duplicateEntry;
module.exports.entryNotFound = entryNotFound;
module.exports.dbError = dbError;
