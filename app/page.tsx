import { getQuizzes } from './actions';
import DeleteQuiz from './DeleteQuiz';

export default async function Home() {
  const quizzes = await getQuizzes();

  return (
    <div className="container mx-auto py-8 p-4 space-y-16">
      {quizzes.map(quiz => (
        <div key={quiz.id} className='space-y-4'>
          <div>
            <h2 className='text-4xl font-bold flex items-center'>
              {quiz.title}
              <DeleteQuiz id={quiz.id} />
            </h2>
            <p>{quiz.description}</p>
          </div>
          {quiz.questions.map(question => (
            <div key={question.id} className='space-y-0'>
              <h3 className='text-xl font-semibold'>{question.description}</h3>
              <ul>
                {question.variants.map(variant => (
                  <li key={variant.id}>
                    <label>
                      <input
                        type="checkbox"
                        className='me-2'
                        disabled
                        checked={variant.status}
                      />
                      {variant.text}
                    </label>
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
