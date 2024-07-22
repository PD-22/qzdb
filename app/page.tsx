import { getQuizzes } from './actions';
import CreateQuiz from './CreateQuiz';
import Quiz from './Quiz';

export default async function Home() {
  const quizzes = await getQuizzes();

  return (
    <div className="container mx-auto py-8 space-y-16">
      <CreateQuiz />
      <div className='space-y-8'>
        {quizzes.map(q => <Quiz key={q.id} {...q} />)}
      </div>
    </div>
  );
}
