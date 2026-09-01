import LoginForm from "@/components/LoginForm";

const NOT_PROVISIONED =
  "Access denied. Account not registered or authorized.";

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  CredentialsSignin: "Invalid email or password.",
  AccessDenied: NOT_PROVISIONED,
  OAuthAccountNotLinked: NOT_PROVISIONED,
  OAuthSignin: "Could not start sign-in with that provider. Please try again.",
  OAuthCallbackError:
    "Could not complete sign-in with that provider. Please try again.",
  Verification: "That sign-in link is invalid or has expired.",
  Configuration:
    "Sign-in is temporarily unavailable. Please contact an administrator.",
};

export default async function SignInPage({searchParams}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const { callbackUrl, error } = await searchParams;

  const errorMessage = error
    ? AUTH_ERROR_MESSAGES[error] ?? "An error occurred during authentication."
    : undefined;

  return (
    <div className="bg-[#F5F0E6] min-h-screen p-3 sm:p-6 font-sans antialiased text-[#0d0e12] relative flex items-center justify-center">
      {/* INNER FRAMED CANVAS CONTAINER */}
      <div className="w-full max-w-[1180px] mx-auto bg-white rounded-[24px] sm:rounded-[32px] overflow-hidden shadow-xl border border-[#E6E2D8]/80 flex flex-col md:flex-row min-h-[600px] relative">
        
        {/* LEFT HERO / BRANDING BANNER */}
        <div
          className="w-full md:w-5/12 min-h-[200px] md:min-h-full bg-cover bg-right-bottom relative flex flex-col justify-center p-8 sm:p-12 text-white overflow-hidden"
          style={{ backgroundImage: "url('/bg_main.png')" }}
        >
          {/* Subtle Overlay */}
          <div className="absolute inset-0 bg-blue-950/20 backdrop-blur-[2px]" />

          {/* Hero Content */}
          <div className="relative z-10 space-y-2 max-w-sm">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight text-white drop-shadow-md">
              Newton School of Technology
            </h2>
          </div>
        </div>

        {/* RIGHT FORM SECTION */}
        <div className="w-full md:w-7/12 flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-white">
          <LoginForm
            callbackUrl={callbackUrl}
            errorMessage={errorMessage}
          />
        </div>
      </div>
    </div>
  );
}
