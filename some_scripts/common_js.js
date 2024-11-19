// 1. 时间戳转换为格式化时间
function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.toISOString().slice(0, 19).replace('T', ' ');
}

// 2. 文本分割为数组
function splitTextToArray(text, separator = '\n') {
    return text.split(separator);
}

// 3. JSON字符串解析
function parseJSON(jsonString) {
    try {
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Invalid JSON string:", error);
        return null;
    }
}

// 4. 文本过滤
function filterText(text, filter) {
    const regex = new RegExp(filter);
    const match = text.match(regex);
    return match ? match[0] : null;
}

// 5. 判断是否为null或undefined
function isNullOrUndefined(value) {
    return value === null || value === undefined;
}
