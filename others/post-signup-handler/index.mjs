import jwt from 'jsonwebtoken';
import axios from 'axios';
import 'dotenv/config';

const secretKey = process.env.JWT_SIGNING_SECRET_KEY;
const apiUrl = process.env.USERS_API_SIGNUP_URL;

export async function handler(event) {
  console.log('Received event:', JSON.stringify(event, null, 2));

  const { email, name, sub } = event.request.userAttributes;

  // Create the JWT

  const tokenPayload = {
    _id: sub,
    email: email,
    name: name,
  };

  const tokenOptions = {
    expiresIn: '1h',
    issuer: 'cognito-signup-handler',
  };

  const token = jwt.sign(tokenPayload, secretKey, tokenOptions);
  console.log('Generated JWT:', token);

  // Post the JWT to the users API

  try {
    await axios.post(apiUrl, { token: token });
  } catch (error) {
    console.error('Error posting JWT to external API:', error);
    throw new Error('Error posting JWT to external API');
  }

  return event;
}

// handler({
//     request: {
//         userAttributes: {
//             sub: '8021e3b1-9c31-4f95-8d6d-e3dac446319b',
//             name: 'Matias J. Apablaza (ITBA)',
//             email: 'mapablaza@itba.edu.ar',
//         }
//     }
// })
