export const isBot = (context) => {
    const userAgent = context.req.headers["user-agent"].toLowerCase();
    return (userAgent.includes("bot") && !userAgent.includes("cubot"));
}