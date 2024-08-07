DROP SCHEMA public CASCADE;

CREATE SCHEMA public;

CREATE TABLE quiz(
    quiz_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT
);

CREATE TABLE question(
    question_id SERIAL PRIMARY KEY,
    quiz_id INT REFERENCES quiz(quiz_id) ON DELETE CASCADE,
    description TEXT NOT NULL
);

CREATE TABLE variant(
    variant_id SERIAL PRIMARY KEY,
    question_id INT REFERENCES question(question_id) ON DELETE CASCADE,
    variant_text TEXT NOT NULL
);

CREATE TABLE answer(
    question_id INT PRIMARY KEY REFERENCES question(question_id) ON DELETE CASCADE,
    variant_id INT REFERENCES variant(variant_id)
);
