import Link from "next/link";

const Page: React.FC = () => {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <div className="text-center py-10">
          <h1>アクセス権限がありません</h1>
          <p>このページを表示するために必要な権限がありません。</p>
          <Link href="/home" className="text-blue-600">
            ホームに戻る
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Page;
