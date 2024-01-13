export const ironOptions = {
    cookieName: "uca_user",
    password: "complex_password_at_least_32_characters_long",
    ttl: 3600,
    maxAge: 3600 - 60,
    // secure: true should be used in production (HTTPS) but can"t be used in development (HTTP)
    secure: true,
    cookieOptions: {
        secure: process.env.NODE_ENV === "production",
    },
};
