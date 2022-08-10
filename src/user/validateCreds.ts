export default function validateCreds(username: string, password: string): boolean {
    return !!username && username.toString().trim() !== "" && /^[a-zA-Z0-9_-]+$/.test(username) && !!password && password.toString().trim() !== "" && password.length >= 8;
}
