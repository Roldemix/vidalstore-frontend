import { Injectable } from '@angular/core';
import { signIn, signUp, confirmSignUp, signOut, fetchAuthSession, getCurrentUser } from 'aws-amplify/auth';

@Injectable({ providedIn: 'root' })
export class AuthService {

  async register(email: string, password: string) {
    return signUp({
      username: email,
      password,
      options: {
        userAttributes: { email },
      },
    });
  }

  async confirmRegistration(email: string, code: string) {
    return confirmSignUp({ username: email, confirmationCode: code });
  }

  async login(email: string, password: string) {
    return signIn({ username: email, password });
  }

  async logout() {
    return signOut();
  }

  async getToken() {
    const session = await fetchAuthSession();
    return session.tokens?.accessToken?.toString();
  }

  async getCurrentUser() {
    return getCurrentUser();
  }

  async getUserGroups(): Promise<string[]> {
    const session = await fetchAuthSession();
    const payload = session.tokens?.accessToken?.payload;
    const groups = payload?.['cognito:groups'] as string[] | undefined;
    return groups ?? [];
  }
}