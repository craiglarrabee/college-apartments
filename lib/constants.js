export const locations = {
    cw: "College Way Apartments",
    sw: "Stadium Way Apartments",
    pp: "Park Place Apartments"
};


export const locationDetails = {
    cw: {
        id: process.env.CW_AUTH_NET_ID,
        key: process.env.CW_AUTH_NET_KEY,
        name: "College Way Apartments"
    },
    sw: {
        id: process.env.SW_AUTH_NET_ID,
        key: process.env.SW_AUTH_NET_KEY,
        name: "Stadium Way Apartments"
    },
    pp: {
        id: process.env.PP_AUTH_NET_ID,
        key: process.env.PP_AUTH_NET_KEY,
        name: "Park Place Apartments"
    },
    TEST: {
        id: process.env.TEST_AUTH_NET_ID,
        key: process.env.TEST_AUTH_NET_KEY
    }
};