import DeleteQuiz from "./DeleteQuiz";
import * as type from "./type";

export default function Quiz(
  { id, title, description, questions }: type.Quiz
) {
  return (
    <div className='space-y-4'>
      <div>
        <h2 className='text-4xl font-bold flex items-center gap-4'>
          {title}<DeleteQuiz id={id} />
        </h2>
        <p>{description}</p>
      </div>
      {questions.map(q => <Question key={q.id} {...q} />)}
    </div>
  );
}

function Question(
  { description, variants }: type.Question
) {
  return (
    <div className='space-y-0'>
      <h3 className='text-xl font-semibold'>{description}</h3>
      <ul>
        {variants.map(variant => (
          <li key={variant.id}>
            <label>
              <input
                type="checkbox"
                className='me-2'
                disabled
                checked={variant.status} />
              {variant.text}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
