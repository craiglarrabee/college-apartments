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

// Square per-property credentials. Use NODE_ENV to pick live vs TEST in callers.
// Expected env vars (examples):
//  - PP_SQUARE_ACCESS_TOKEN, PP_SQUARE_LOCATION_ID
//  - TEST_SQUARE_ACCESS_TOKEN, TEST_SQUARE_LOCATION_ID
export const squareLocationDetails = {
    pp: {
        accessToken: process.env.PP_SQUARE_ACCESS_TOKEN,
        locationId: process.env.PP_SQUARE_LOCATION_ID,
        name: "Park Place Apartments"
    },
    TEST: {
        accessToken: process.env.TEST_SQUARE_ACCESS_TOKEN,
        locationId: process.env.TEST_SQUARE_LOCATION_ID
    }
};
