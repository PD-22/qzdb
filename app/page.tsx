import { getRandomNumber } from './actions';

export default async function Home() {
  const randomNumber = await getRandomNumber();

  return (
    <pre className="flex min-h-screen items-center justify-center">
      Random Number: {randomNumber}
    </pre>
  );
}
