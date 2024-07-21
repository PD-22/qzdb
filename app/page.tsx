import { getQuizzes } from './actions';
import Quiz from './Quiz';

export default async function Home() {
  const quizzes = await getQuizzes();

  return (
    <div className="container mx-auto p-4 space-y-8">
      <div className='space-y-16 p-4'>
        {quizzes.map(q => <Quiz key={q.id} {...q} />)}
      </div>
    </div>
  );
}
