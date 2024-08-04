DROP SCHEMA public CASCADE;

CREATE SCHEMA public;

CREATE TABLE quiz(
    quiz_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL UNIQUE,
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

CREATE FUNCTION get_quiz_table()
RETURNS TABLE (
    quiz_id INT,
    title VARCHAR,
    description TEXT,
    question_id INT,
    question_description TEXT,
    variant_id INT,
    variant_text TEXT,
    answer_status BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        q.quiz_id,
        q.title,
        q.description,
        qu.question_id,
        qu.description as question_description,
        v.variant_id,
        v.variant_text,
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
END;
$$ LANGUAGE plpgsql;

CREATE PROCEDURE create_quiz(json_data JSONB) LANGUAGE plpgsql AS $$
DECLARE
    v_quiz_id INTEGER;
    v_question_id INTEGER;
    v_variant_id INTEGER;
    test_rec JSONB;
    variant_rec JSONB;
    v_answer_index INTEGER;
    v_variant_index INTEGER;
    v_answer_found BOOLEAN := FALSE;
BEGIN
    IF jsonb_typeof(json_data -> 'title') IS DISTINCT FROM 'string' THEN
        RAISE EXCEPTION 'Invalid title';
    END IF;
    IF jsonb_typeof(json_data -> 'description') IS DISTINCT FROM 'string' THEN
        RAISE EXCEPTION 'Invalid description';
    END IF;
    IF jsonb_typeof(json_data -> 'questions') IS DISTINCT FROM 'array' THEN
        RAISE EXCEPTION 'Invalid questions';
    END IF;

    INSERT INTO quiz (title, description)
    VALUES (json_data->>'title', json_data->>'description')
    RETURNING quiz_id INTO v_quiz_id;

    FOR test_rec IN SELECT * FROM jsonb_array_elements(json_data->'questions')
    LOOP
        IF jsonb_typeof(test_rec -> 'description') IS DISTINCT FROM 'string' THEN
            RAISE EXCEPTION 'Invalid question description';
        END IF;
        IF jsonb_typeof(test_rec -> 'variants') IS DISTINCT FROM 'array' THEN
            RAISE EXCEPTION 'Invalid variants';
        END IF;
        IF jsonb_typeof(test_rec -> 'answer') IS DISTINCT FROM 'number' THEN
            RAISE EXCEPTION 'Invalid answer index';
        END IF;

        INSERT INTO question (quiz_id, description)
        VALUES (v_quiz_id, test_rec->>'description')
        RETURNING question_id INTO v_question_id;

        v_answer_index := (test_rec ->> 'answer')::integer;
        v_variant_index := 0;
        v_answer_found := FALSE;

        FOR variant_rec IN SELECT * FROM jsonb_array_elements(test_rec->'variants')
        LOOP
            IF jsonb_typeof(variant_rec -> 'text') IS DISTINCT FROM 'string' THEN
                RAISE EXCEPTION 'Invalid variant text';
            END IF;

            INSERT INTO variant (question_id, variant_text)
            VALUES (v_question_id, variant_rec->>'text')
            RETURNING variant_id INTO v_variant_id;

            IF v_variant_index = v_answer_index THEN
                INSERT INTO answer (question_id, variant_id)
                VALUES (v_question_id, v_variant_id);
                v_answer_found := TRUE;
            END IF;

            v_variant_index := v_variant_index + 1;
        END LOOP;

        IF NOT v_answer_found THEN
            RAISE EXCEPTION 'Invalid answer';
        END IF;
    END LOOP;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END;
$$;
