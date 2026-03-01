import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  ConfirmSignUpCommand,
  InitiateAuthCommand,
  type AuthenticationResultType,
} from "@aws-sdk/client-cognito-identity-provider";
import { Resource } from "sst";

/**
 * Derive the AWS region from the Cognito User Pool ID (format: <region>_<id>).
 */
function getRegion(): string {
  return Resource.UserPool.id.split("_")[0];
}

function getClient(): CognitoIdentityProviderClient {
  return new CognitoIdentityProviderClient({ region: getRegion() });
}

// ─── Sign Up ─────────────────────────────────────────────────────────────────

export async function signUp(email: string, password: string) {
  const client = getClient();

  await client.send(
    new SignUpCommand({
      ClientId: Resource.WebClient.id,
      Username: email,
      Password: password,
      UserAttributes: [{ Name: "email", Value: email }],
    }),
  );

  return { success: true, email };
}

// ─── Confirm Sign Up ─────────────────────────────────────────────────────────

export async function confirmSignUp(email: string, code: string) {
  const client = getClient();

  await client.send(
    new ConfirmSignUpCommand({
      ClientId: Resource.WebClient.id,
      Username: email,
      ConfirmationCode: code,
    }),
  );

  return { success: true };
}

// ─── Sign In ─────────────────────────────────────────────────────────────────

export interface AuthTokens {
  idToken: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

function mapTokens(result: AuthenticationResultType): AuthTokens {
  if (!result.IdToken || !result.AccessToken || !result.RefreshToken) {
    throw new Error("Incomplete authentication result");
  }

  return {
    idToken: result.IdToken,
    accessToken: result.AccessToken,
    refreshToken: result.RefreshToken,
    expiresIn: result.ExpiresIn ?? 3600,
  };
}

export async function signIn(
  email: string,
  password: string,
): Promise<AuthTokens> {
  const client = getClient();

  const response = await client.send(
    new InitiateAuthCommand({
      ClientId: Resource.WebClient.id,
      AuthFlow: "USER_PASSWORD_AUTH",
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    }),
  );

  if (!response.AuthenticationResult) {
    throw new Error("Authentication failed");
  }

  return mapTokens(response.AuthenticationResult);
}

// ─── Refresh Tokens ──────────────────────────────────────────────────────────

export async function refreshTokens(
  refreshToken: string,
): Promise<Omit<AuthTokens, "refreshToken">> {
  const client = getClient();

  const response = await client.send(
    new InitiateAuthCommand({
      ClientId: Resource.WebClient.id,
      AuthFlow: "REFRESH_TOKEN_AUTH",
      AuthParameters: {
        REFRESH_TOKEN: refreshToken,
      },
    }),
  );

  if (!response.AuthenticationResult) {
    throw new Error("Token refresh failed");
  }

  return {
    idToken: response.AuthenticationResult.IdToken!,
    accessToken: response.AuthenticationResult.AccessToken!,
    expiresIn: response.AuthenticationResult.ExpiresIn ?? 3600,
  };
}
