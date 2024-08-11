import { useRouteLoaderData } from "@remix-run/react";

export default function Home() {

  const data = useRouteLoaderData<{name: string}>('root');

  if(!data) return null;
  const { name } = data;

  return (
    <div>
      <h1>Home</h1>
      <div> Welcome !! {name} </div>
    </div>
  );
}