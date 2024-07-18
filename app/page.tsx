import { getQuizzes } from './actions';

export default async function Home() {
  const quizzes = await getQuizzes();

  return (
    <pre className="flex min-h-screen items-center justify-center">
      {JSON.stringify(quizzes, null, 2)}
    </pre>
  );
}
