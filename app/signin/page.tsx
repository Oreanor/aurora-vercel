'use client';

import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import { useI18n } from '@/components/providers/i18n-provider';

export default function SignInPage() {
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusVariant, setStatusVariant] = useState<'success' | 'error' | null>(null);
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const errorMessages: Record<string, string> = {
    OAuthSignin: t("auth.errors.OAuthSignin"),
    OAuthCallback: t("auth.errors.OAuthCallback"),
    OAuthCreateAccount: t("auth.errors.OAuthCreateAccount"),
    EmailCreateAccount: t("auth.errors.EmailCreateAccount"),
    Callback: t("auth.errors.Callback"),
    OAuthAccountNotLinked: t("auth.errors.OAuthAccountNotLinked"),
    EmailSignin: t("auth.errors.EmailSignin"),
    CredentialsSignin: t("auth.errors.CredentialsSignin"),
    SessionRequired: t("auth.errors.SessionRequired"),
    Default: t("auth.errors.Default"),
  };

  const errorCode = searchParams.get('error') ?? null;
  const errorMessage = errorCode ? errorMessages[errorCode] ?? errorMessages.Default : null;

  const clearErrorAndRetry = () => {
    router.replace('/signin');
  };

  const clearStatus = () => {
    setStatusMessage(null);
    setStatusVariant(null);
  };

  // Redirect if user is already authenticated
  useEffect(() => {
    if (session) {
      router.push('/');
    }
  }, [session, router]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    clearStatus();
    
    try {
      await signIn('email', { 
        email, 
        redirect: false,
        callbackUrl: '/'
      });
      setStatusVariant('success');
      setStatusMessage(t("auth.magicLinkSent"));
    } catch (error) {
      console.error('Error sending magic link:', error);
      setStatusVariant('error');
      setStatusMessage(t("auth.magicLinkError"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/' });
  };

  return (
    <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 px-4 py-12 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t("auth.welcomeBack")}</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">{t("auth.signInSubtitle")}</p>
        </div>

        {errorCode && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-left">
            <p className="font-medium text-red-800">
              {t("auth.errorTitle", { code: errorCode })}
            </p>
            <p className="mt-1 text-sm text-red-700">{errorMessage}</p>
            <p className="mt-2 text-xs text-red-600">
              {t("auth.errorHint", { path: "/api/auth/callback/google" })}
            </p>
            <button
              type="button"
              onClick={clearErrorAndRetry}
              className="mt-3 text-sm font-medium text-red-700 underline hover:text-red-800"
            >
              {t("auth.dismissAndRetry")}
            </button>
          </div>
        )}

        {statusMessage && (
          <div
            className={`rounded-lg border p-4 text-left ${
              statusVariant === 'success'
                ? 'border-green-200 bg-green-50 text-green-800 dark:border-green-900/60 dark:bg-green-950/40 dark:text-green-300'
                : 'border-red-200 bg-red-50 text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300'
            }`}
            role="status"
            aria-live="polite"
          >
            <div className="flex items-start justify-between gap-4">
              <p className="text-sm font-medium">{statusMessage}</p>
              <button
                type="button"
                onClick={clearStatus}
                className="text-xs underline underline-offset-2 hover:opacity-80"
              >
                {t("common.close")}
              </button>
            </div>
          </div>
        )}

        <div className="rounded-lg bg-white px-6 py-8 shadow-xl dark:bg-gray-900">
          {/* Email Form */}
          <form onSubmit={handleEmailSubmit} className="space-y-6">
            <Input
              label={t("auth.emailAddress")}
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("auth.emailPlaceholder")}
              className="mt-1"
            />

            <Button
              type="submit"
              disabled={isLoading}
              variant="primary"
              className="w-full"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t("auth.sendingMagicLink")}
                </div>
              ) : (
                t("auth.sendMagicLink")
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500 dark:bg-gray-900 dark:text-gray-400">{t("auth.orContinueWith")}</span>
              </div>
            </div>
          </div>

          {/* Google Sign In */}
          <div className="mt-6">
            <Button
              onClick={handleGoogleSignIn}
              variant="outline"
              className="w-full flex justify-center items-center"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {t("auth.continueWithGoogle")}
            </Button>
          </div>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {t("auth.dontHaveAccount")}{' '}
              <a href="/signup" className="font-medium text-blue-600 hover:text-blue-500">
                {t("common.signUp")}
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
