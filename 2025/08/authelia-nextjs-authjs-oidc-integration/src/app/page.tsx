import { signOut } from "@/auth"

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="gap-[32px] row-start-2 items-center sm:items-start text-5xl">
        <h1 className="mb-8">Authelia Example</h1>
        <form
          action={async () => {
            "use server"
            await signOut()
          }}
        >
          <button 
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Signout
          </button>
        </form>
      </main>
    </div>
  );
}
