import axios from "axios";

// Set config defaults when creating the instance
const instance = axios.create({
    baseURL: 'https://f2c7f522-ef47-48ce-a429-3fc2f15d2011-prod.e1-us-east-azure.choreoapis.dev/dlsm/testgptservice/endpoint-9090-803/1.1.0'
});

const auth = axios.create({
    baseURL: 'https://sts.choreo.dev/oauth2'
})

// Resolve Oauth client credential
const resolveOauthClientCredential = async () => {
    // Your code here to resolve Oauth client credential
    try {
        const response = await auth.post('/token', "grant_type=client_credentials", {
            headers: {
                Authorization: `Basic ${Buffer.from('ny23GsQFUtiKdLe88MGtgXInBdUa:kjBQ9dOGN9BB8flt5dpKZaf8SbMa').toString('base64')}`
            }
        });
        const accessToken = response.data.access_token;
        instance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    } catch (error) {
        console.error('Failed to resolve Oauth client credential:', error);
    }
};

const API = {
    ready: new Promise((resolve, reject) => {
        resolveOauthClientCredential()
            .then(() => {
                resolve(instance);
            })
            .catch((error) => {
                reject(error);
            });
    })
};



export default API;