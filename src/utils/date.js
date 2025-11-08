import dayjs from 'dayjs';

export function parseBackendDate(dateStr) {
    if (!dateStr) return dayjs();

    // 尝试直接解析
    let date = dayjs(dateStr);
    if (date.isValid()) return date;

    // 尝试时间戳
    if (/^\d+$/.test(dateStr)) {
        const num = Number(dateStr);
        return num > 9999999999 ? dayjs(num) : dayjs.unix(num);
    }

    // 尝试常见格式
    const formats = [
        'YYYY-MM-DDTHH:mm:ssZ',  // ISO8601
        'YYYY-MM-DD HH:mm:ss',   // 数据库格式
        'YYYY/MM/DD HH:mm:ss',   // 其他格式
        'YYYY-MM-DD',
        'DD-MM-YYYY HH:mm:ss',
        'MM-DD-YYYY HH:mm:ss'
    ];

    for (const fmt of formats) {
        date = dayjs(dateStr, fmt);
        if (date.isValid()) return date;
    }

    console.warn(`无法解析的日期: ${dateStr}`);
    return dayjs();
}