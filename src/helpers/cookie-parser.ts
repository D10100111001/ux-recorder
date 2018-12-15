export class CookieParser {
    static parse(cookieStr: string) {
        const cookies = {};
        cookieStr.split(';').forEach(keyVal => {
            const [key, val] = keyVal.split('=');
            cookies[key.trim()] = decodeURIComponent(val);
        });
        return cookies;
    }
}