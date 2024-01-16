export const ironOptions = {
    cookieName: "uca_user",
    password: "complex_password_at_least_32_characters_long",
    ttl: 14400,
    maxAge: 14400 - 60,
    // secure: true should be used in production (HTTPS) but can't be used in development (HTTP)
    cookieOptions: {
        secure: process.env.NODE_ENV === "production",
    },
};
