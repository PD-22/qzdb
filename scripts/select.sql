SELECT * FROM quiz;
SELECT * FROM question;
SELECT * FROM variant;
SELECT * FROM answer;
SELECT
    q.quiz_id as id,
    q.title as quiz,
    qu.question_id as id,
    qu.description as question,
    v.variant_id as id,
    v.variant_text as variant,
    CASE WHEN a.variant_id = v.variant_id THEN TRUE ELSE FALSE END AS answer_status
FROM 
    quiz q
JOIN 
    question qu ON q.quiz_id = qu.quiz_id
JOIN 
    variant v ON qu.question_id = v.question_id
LEFT JOIN 
    answer a ON qu.question_id = a.question_id AND v.variant_id = a.variant_id
ORDER BY q.quiz_id, qu.question_id, v.variant_id;
