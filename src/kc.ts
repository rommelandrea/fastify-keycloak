import { request } from 'undici';
import qs from 'querystring';

const KEYCLOAK_BASE_URL = 'https://keycloak.example.com';
const REALM = 'demo';
const CLIENT_ID = 'document-service';
const CLIENT_SECRET = '3CwiTReCIFTCxmo7Q7TviFE1EpAtVBJ7';

// Step 1: Ottieni token client per autorizzare le richieste alla permission API
async function getClientToken() {
  const response = await request(`${KEYCLOAK_BASE_URL}/realms/${REALM}/protocol/openid-connect/token`, {
    method: 'POST',
    body: qs.stringify({
      grant_type: 'client_credentials',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET
    }),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });

  const body = await response.body.json();
  return body.access_token;
}

// Step 2: Chiedi a Keycloak se l’utente ha il permesso di fare qualcosa
export async function authorizeWithKeycloak(rptToken: string, resource: string, scope: string): Promise<boolean> {
  const clientToken = await getClientToken();

  const response = await request(`${KEYCLOAK_BASE_URL}/realms/${REALM}/protocol/openid-connect/token`, {
    method: 'POST',
    body: qs.stringify({
      grant_type: 'urn:ietf:params:oauth:grant-type:uma-ticket',
      audience: CLIENT_ID,
      permission: `${resource}#${scope}`,
      response_mode: 'decision',
      submit_request: true
    }),
    headers: {
      Authorization: `Bearer ${rptToken}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });

  const body = await response.body.json();
  return body.result === true;
}
