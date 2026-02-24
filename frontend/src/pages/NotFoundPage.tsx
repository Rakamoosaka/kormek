import { useNavigate } from "react-router-dom";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6 text-center">
      {/* Giant 404 */}
      <h1 className="font-display text-[clamp(8rem,25vw,20rem)] leading-[0.85] text-green tracking-tight select-none">
        404
      </h1>

      {/* Message */}
      <p className="font-display text-[clamp(1.2rem,3vw,2.5rem)] leading-tight text-eggshell mt-4 max-w-lg">
        SORRY, WE COULD
        <br />
        NOT FIND THE PAGE
      </p>

      {/* Back home button */}
      <button
        onClick={() => navigate("/")}
        className="mt-10 border-2 border-eggshell/60 text-eggshell font-display text-lg tracking-widest px-8 py-3 hover:bg-eggshell hover:text-black transition-colors cursor-pointer"
      >
        BACK HOME
      </button>
    </div>
  );
}
