import DeleteQuiz from "./DeleteQuiz";
import * as type from "./type";

export default function Quiz(
  { id, title, description, questions }: type.Quiz
) {
  return (
    <div className='space-y-4'>
      <div>
        <h3 className='text-3xl font-bold flex items-center gap-4'>
          {title}<DeleteQuiz id={id} />
        </h3>
        <p>{description}</p>
      </div>
      {questions.map(q => <Question key={q.id} {...q} />)}
    </div>
  );
}

function Question(
  { description, variants, answer }: type.Quiz['questions'][number]
) {
  return (
    <div className='space-y-0'>
      <h4 className='text-xl font-semibold'>{description}</h4>
      <ul>
        {variants.map((variant, index) => (
          <li key={variant.id}>
            <label>
              <input
                type="checkbox"
                className='me-2'
                disabled
                name={variant.id.toString()}
                checked={index === answer}
              />
              {variant.text}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
