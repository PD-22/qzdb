import { Separator } from '@/components/ui/separator';
import { getQuizzes } from './actions';
import CreateQuiz from './CreateQuiz';
import Quiz from './Quiz';

export default async function Home() {
  const quizzes = await getQuizzes();

  return (
    <div className="container mx-auto py-8 space-y-12">
      <CreateQuiz />
      {quizzes.length > 0 && (
        <>
          <Separator />
          <div className='space-y-8'>
            <h2 className='text-4xl font-bold'>Quizzes</h2>
            {quizzes.map(q => <Quiz key={q.id} {...q} />)}
          </div>
        </>
      )}
    </div>
  );
}
