import { LanguageToggle } from '@/components/ui/language-toggle';

const AuthLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:flex-1 items-center justify-center bg-linear-to-br from-primary/10 via-primary/5 to-background p-12">
        <div className="max-w-md space-y-6 text-center">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-primary/10 backdrop-blur-sm shadow-lg">
            <svg
              className="h-12 w-12 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              M/S Raj Travel
            </h1>
            <p className="mt-3 text-lg text-muted-foreground">
              Your Trusted Travel Partner
            </p>
          </div>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Explore the world with confidence</p>
            <p>Professional travel management solutions</p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex flex-1 items-center justify-center p-6 bg-background relative">
        <div className="absolute top-4 right-4">
          <LanguageToggle />
        </div>
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-0 left-0 right-0 border-t bg-background px-4 py-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center">
            <p>© All rights reserved M/S Raj Travels</p>
          </div>
          <div className="flex items-center">
            <p>
              Developed by{' '}
              <a
                href="https://zehad.me"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline text-primary"
              >
                Zehad
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AuthLayout;
