import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import qs from 'qs';

export async function signInWithCode(code: string) {
    const tokenUrl = `${import.meta.env.VITE_COGNITO_URL}/oauth2/token`;

    const response = await axios.post(tokenUrl,
        qs.stringify({
            client_id: `${import.meta.env.VITE_COGNITO_CLIENT_ID}`,
            grant_type: 'authorization_code',
            code,
            redirect_uri: `${import.meta.env.VITE_APP_URL}`,
        }),
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }
    );

    const decodedToken = jwtDecode(response.data.id_token);

    localStorage.setItem('uuid', decodedToken.sub!);
    localStorage.setItem('id_token', response.data.id_token);
    localStorage.setItem('refresh_token', response.data.refresh_token);
}

export async function signInWithRefreshToken(refreshToken: string) {
    const tokenUrl = `${import.meta.env.VITE_COGNITO_URL}/oauth2/token`;

    const response = await axios.post(tokenUrl,
        qs.stringify({
            client_id: `${import.meta.env.VITE_COGNITO_CLIENT_ID}`,
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
        }),
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }
    );

    const decodedToken = jwtDecode(response.data.id_token);

    localStorage.setItem('uuid', decodedToken.sub!);
    localStorage.setItem('id_token', response.data.id_token);
}