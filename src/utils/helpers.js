import { User } from "../models/index.js";

export const generateUsernameSuggestions = (username, upto) => {
    const suggestions = new Set();
    for(let i = 0; i < upto; i++) {
    const randomSuffix = Math.floor(Math.random() * 1000);
    suggestions.add(`${username}${randomSuffix}`);
    }

    return Array.from(suggestions).slice(0, 5);
};

export async function getAvailableSuggestions(baseUsername, count = 3) {
    const suggestions = generateUsernameSuggestions(baseUsername, count * 2);
    const checks = await Promise.all(
        suggestions.map(async (suggestion) => {
            const exists = await User.exists({ username: suggestion });
            return exists ? null : suggestion;
        })
    );
    return [...new Set(checks.filter(Boolean))].slice(0, count);
}