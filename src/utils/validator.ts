export const isValidEmail = (email?: string): boolean => {
    
    if (!email || typeof email !== "string") {
        return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    
    if (!email.includes("@")) {
        return false;
    }

    const [localPart, domain] = email.split("@");

    
    if (!localPart || !domain) {
        return false;
    }

    const allowedDomains = process.env.ALLOWED_DOMAINS
        ? process.env.ALLOWED_DOMAINS.split(",").map(d => d.trim())
        : [];

    const minLocalPartLength = 1;
    const maxLocalPartLength = 128;

    return (
        emailRegex.test(email) &&
        localPart.length >= minLocalPartLength &&
        localPart.length <= maxLocalPartLength &&
        (allowedDomains.length === 0 || allowedDomains.includes(domain))
    );
};
