import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import type {
  LoginInput,
  LoginResponse,
  SessionUser,
} from '@smartshelf/contracts';
import { ApiRequestError, createApiClient } from '../../lib/api';
import {
  isSessionUser,
  readSessionToken,
  storeSessionToken,
} from './session-storage';

interface AuthContextValue {
  user: SessionUser | null;
  accessToken: string | null;
  signIn: (input: LoginInput) => Promise<SessionUser>;
  signOut: () => void;
  sessionNotice: string;
  invalidateSession: () => void;
  isRestoring: boolean;
  restoreError: string;
  retryRestore: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [savedToken] = useState(readSessionToken);
  const [session, setSession] = useState<LoginResponse | null>(null);
  const [isRestoring, setIsRestoring] = useState(!!savedToken);
  const [restoreError, setRestoreError] = useState('');
  const [restoreRevision, setRestoreRevision] = useState(0);
  const [sessionNotice, setSessionNotice] = useState('');
  const generation = useRef(0);

  const signOut = useCallback(() => {
    generation.current += 1;
    setSession(null);
    setSessionNotice('');
    storeSessionToken(null);
    setIsRestoring(false);
    setRestoreError('');
  }, []);

  const expireSession = useCallback(() => {
    generation.current += 1;
    setSession(null);
    setSessionNotice('Your session has expired. Please sign in again.');
    storeSessionToken(null);
    setIsRestoring(false);
    setRestoreError('');
  }, []);

  const retryRestore = useCallback(() => {
    setIsRestoring(true);
    setRestoreError('');
    setRestoreRevision((value) => value + 1);
  }, []);

  useEffect(() => {
    if (!savedToken) return;
    const controller = new AbortController();
    const current = generation.current;
    createApiClient(savedToken)<SessionUser>('/auth/me', {
      signal: controller.signal,
    })
      .then((user) => {
        if (controller.signal.aborted || current !== generation.current) return;
        if (!isSessionUser(user)) {
          expireSession();
          return;
        }
        setSession({ accessToken: savedToken, user });
        setIsRestoring(false);
        setRestoreError('');
      })
      .catch((reason) => {
        if (controller.signal.aborted || current !== generation.current) return;
        if (reason instanceof ApiRequestError && reason.status === 401)
          expireSession();
        else {
          setIsRestoring(false);
          setRestoreError(
            'Unable to verify your saved session. Check your connection and try again.',
          );
        }
      });
    return () => controller.abort();
  }, [savedToken, restoreRevision, expireSession]);

  async function signIn(input: LoginInput): Promise<SessionUser> {
    const attempt = ++generation.current;
    const result = await createApiClient()<LoginResponse>('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    if (
      typeof result.accessToken !== 'string' ||
      !result.accessToken.trim() ||
      !isSessionUser(result.user)
    ) {
      throw new Error('The server returned an invalid sign-in response.');
    }

    if (attempt !== generation.current)
      throw new Error('Sign-in was cancelled. Please try again.');
    setSessionNotice('');
    storeSessionToken(result.accessToken);
    setIsRestoring(false);
    setRestoreError('');
    setSession(result);
    return result.user;
  }

  useEffect(() => {
    if (!session) return;
    const controller = new AbortController();
    const current = generation.current;
    const request = createApiClient(session.accessToken, () => {
      if (!controller.signal.aborted && generation.current === current)
        expireSession();
    });
    const validate = () => {
      request<SessionUser>('/auth/me', { signal: controller.signal })
        .then((user) => {
          if (controller.signal.aborted || generation.current !== current)
            return;
          if (!isSessionUser(user)) {
            expireSession();
          } else {
            setSession((previous) => previous && { ...previous, user });
          }
        })
        .catch(() => {
          /* A transient network error does not erase a valid session. */
        });
    };
    window.addEventListener('focus', validate);
    const timer = window.setInterval(validate, 60_000);
    return () => {
      controller.abort();
      window.removeEventListener('focus', validate);
      window.clearInterval(timer);
    };
  }, [session?.accessToken, expireSession]);

  return (
    <AuthContext.Provider
      value={{
        user: session?.user ?? null,
        accessToken: session?.accessToken ?? null,
        signIn,
        signOut,
        sessionNotice,
        invalidateSession: expireSession,
        isRestoring,
        restoreError,
        retryRestore,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }

  return context;
}
