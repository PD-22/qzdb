INSERT INTO quiz (title, description) VALUES ('Example quiz', 'This is an example quiz with random questions');
INSERT INTO quiz (title, description) VALUES ('Second Quiz', 'This is the second quiz with three questions');
INSERT INTO quiz (title, description) VALUES ('Sample Quiz', 'This is a sample quiz.');

INSERT INTO question (quiz_id, description) VALUES (1, 'What does CSS Stands for?');
INSERT INTO question (quiz_id, description) VALUES (1, 'What is the capital city of Australia?');
INSERT INTO question (quiz_id, description) VALUES (2, 'What is the chemical symbol for water?');
INSERT INTO question (quiz_id, description) VALUES (2, 'Who wrote 'Romeo and Juliet'?');
INSERT INTO question (quiz_id, description) VALUES (2, 'What planet is known as the Red Planet?');
INSERT INTO question (quiz_id, description) VALUES (3, 'What is the capital of France?');

INSERT INTO variant (question_id, variant_text) VALUES (1, 'Computer Styled Sections');
INSERT INTO variant (question_id, variant_text) VALUES (1, 'Cascading Style Sheets');
INSERT INTO variant (question_id, variant_text) VALUES (1, 'Crazy Solid Shapes');
INSERT INTO variant (question_id, variant_text) VALUES (1, 'None of the above');
INSERT INTO variant (question_id, variant_text) VALUES (2, 'Sydney');
INSERT INTO variant (question_id, variant_text) VALUES (2, 'Melbourne');
INSERT INTO variant (question_id, variant_text) VALUES (2, 'Canberra');
INSERT INTO variant (question_id, variant_text) VALUES (2, 'Brisbane');
INSERT INTO variant (question_id, variant_text) VALUES (3, 'H2O');
INSERT INTO variant (question_id, variant_text) VALUES (3, 'O2');
INSERT INTO variant (question_id, variant_text) VALUES (3, 'H2');
INSERT INTO variant (question_id, variant_text) VALUES (3, 'HO');
INSERT INTO variant (question_id, variant_text) VALUES (4, 'Charles Dickens');
INSERT INTO variant (question_id, variant_text) VALUES (4, 'Mark Twain');
INSERT INTO variant (question_id, variant_text) VALUES (4, 'William Shakespeare');
INSERT INTO variant (question_id, variant_text) VALUES (4, 'Ernest Hemingway');
INSERT INTO variant (question_id, variant_text) VALUES (5, 'Earth');
INSERT INTO variant (question_id, variant_text) VALUES (5, 'Mars');
INSERT INTO variant (question_id, variant_text) VALUES (5, 'Jupiter');

INSERT INTO answer (question_id, variant_id) VALUES (1, 2);
INSERT INTO answer (question_id, variant_id) VALUES (2, 7);
INSERT INTO answer (question_id, variant_id) VALUES (3, 9);
INSERT INTO answer (question_id, variant_id) VALUES (4, 15);
INSERT INTO answer (question_id, variant_id) VALUES (5, 18);
INSERT INTO answer (question_id, variant_id) VALUES (6, 21);
