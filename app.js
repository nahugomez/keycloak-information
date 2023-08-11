const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const PORT = process.env.PORT;
const KEYCLOAK_HOST = process.env.KEYCLOAK_HOST;
const KEYCLOAK_USER = process.env.KEYCLOAK_USER;
const KEYCLOAK_PASSWORD = process.env.KEYCLOAK_PASSWORD;
const KEYCLOAK_CLIENT = process.env.KEYCLOAK_CLIENT;
const API_JWT_GENERATOR = process.env.API_JWT_GENERATOR;

const getKeycloakToken = async (username, password, client) => {
    const { data } = await axios({
        url: `${API_JWT_GENERATOR}/jwt/generate`,
        method: "POST",
        data: {
            user: username,
            password: password,
            client: client,
        },
    });
    return data.access_token;
};

const getKeycloakProfileInfo = async (user_id) => {
    const { data } = await axios({
        url: `${KEYCLOAK_HOST}/auth/admin/realms/hasura/users/${user_id}`,
        method: "GET",
        headers: {
            Authorization: `Bearer ${await getKeycloakToken(KEYCLOAK_USER, KEYCLOAK_PASSWORD, KEYCLOAK_CLIENT)}`,
        },
    });
    return data;
};

app.post("/keycloak", async (req, res) => {
    try {
        const body = req.body;
        const profileInfo = await getKeycloakProfileInfo(body.user_id);
        console.log(profileInfo);
        res.send({
            id: profileInfo.id,
            username: profileInfo.username,
            firstName: profileInfo.firstName,
            lastName: profileInfo.lastName,
        });
    } catch (error) {
        console.error("Error obtaining user info");
        return res.status(500).send({
            error_code: 500,
            message: "An error was happened",
        });
    }
});

app.listen(PORT, () => {
    console.log(`App is listening on port ${PORT}`);
});
