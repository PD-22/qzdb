import { getQuizzes } from './actions';

export default async function Home() {
  const quizzes = await getQuizzes();

  return (
    <div className="container mx-auto py-8 p-4 space-y-16">
      {quizzes.map(quiz => (
        <div key={quiz.id} className='space-y-4'>
          <div>
            <h2 className='text-4xl font-bold'>{quiz.title}</h2>
            <p>{quiz.description}</p>
          </div>
          {quiz.tests.map(test => (
            <div key={test.id} className='space-y-0'>
              <h3 className='text-xl font-semibold'>{test.question}</h3>
              <ul>
                {test.variants.map(variant => (
                  <li key={variant.id}>
                    <span className='me-2'>{variant.status ? '☑︎' : '☐'}</span>
                    {variant.text}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
