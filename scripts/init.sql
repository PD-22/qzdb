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
    question_text TEXT NOT NULL
);

CREATE TABLE variant(
    variant_id SERIAL PRIMARY KEY,
    question_id INT REFERENCES question(question_id) ON DELETE CASCADE,
    variant_text TEXT NOT NULL
);

CREATE TABLE answer(
    answer_id SERIAL PRIMARY KEY,
    question_id INT REFERENCES question(question_id) ON DELETE CASCADE,
    variant_id INT REFERENCES variant(variant_id)
);

CREATE FUNCTION get_quiz_table()
RETURNS TABLE (
    quiz_id INT,
    title VARCHAR,
    description TEXT,
    question_id INT,
    question_text TEXT,
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
        qu.question_text,
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

CREATE FUNCTION get_quiz_data() RETURNS JSONB AS $$
BEGIN
    RETURN (
        WITH variants_cte AS (
            SELECT
                qu.question_id,
                jsonb_agg(
                    jsonb_build_object(
                        'text', v.variant_text,
                        'status', CASE WHEN ca.variant_id = v.variant_id THEN TRUE ELSE FALSE END
                    )
                    ORDER BY v.variant_id
                ) AS variants
            FROM
                question qu
            JOIN
                variant v ON qu.question_id = v.question_id
            LEFT JOIN
                answer ca ON v.variant_id = ca.variant_id
            GROUP BY
                qu.question_id
        ),
        questions_cte AS (
            SELECT
                qu.quiz_id,
                jsonb_agg(
                    jsonb_build_object(
                        'question', qu.question_text,
                        'variants', vct.variants
                    )
                    ORDER BY qu.question_id
                ) AS questions
            FROM
                question qu
            JOIN
                variants_cte vct ON qu.question_id = vct.question_id
            GROUP BY
                qu.quiz_id
        )
        SELECT jsonb_agg(
            jsonb_build_object(
                'title', q.title,
                'description', q.description,
                'tests', qct.questions
            )
            ORDER BY q.quiz_id
        )
        FROM
            quiz q
        JOIN
            questions_cte qct ON q.quiz_id = qct.quiz_id
    );
END;
$$ LANGUAGE plpgsql;

CREATE PROCEDURE create_quiz(json_data JSONB) LANGUAGE plpgsql AS $$
DECLARE
    v_quiz_id INTEGER;
    v_question_id INTEGER;
    v_variant_id INTEGER;
    test_rec JSONB;
    variant_rec JSONB;
BEGIN
    IF jsonb_typeof(json_data -> 'title') IS DISTINCT FROM 'string' THEN
        RAISE EXCEPTION 'Invalid title';
    END IF;
    IF jsonb_typeof(json_data -> 'description') IS DISTINCT FROM 'string' THEN
        RAISE EXCEPTION 'Invalid description';
    END IF;
    IF jsonb_typeof(json_data -> 'tests') IS DISTINCT FROM 'array' THEN
        RAISE EXCEPTION 'Invalid tests';
    END IF;

    INSERT INTO quiz (title, description)
    VALUES (json_data->>'title', json_data->>'description')
    RETURNING quiz_id INTO v_quiz_id;

    FOR test_rec IN SELECT * FROM jsonb_array_elements(json_data->'tests')
    LOOP
        IF jsonb_typeof(test_rec -> 'question') IS DISTINCT FROM 'string' THEN
            RAISE EXCEPTION 'Invalid question';
        END IF;
        IF jsonb_typeof(test_rec -> 'variants') IS DISTINCT FROM 'array' THEN
            RAISE EXCEPTION 'Invalid variants';
        END IF;

        INSERT INTO question (quiz_id, question_text)
        VALUES (v_quiz_id, test_rec->>'question')
        RETURNING question_id INTO v_question_id;

        FOR variant_rec IN SELECT * FROM jsonb_array_elements(test_rec->'variants')
        LOOP
            IF jsonb_typeof(variant_rec -> 'text') IS DISTINCT FROM 'string' THEN
                RAISE EXCEPTION 'Invalid variant text';
            END IF;
            IF jsonb_typeof(variant_rec -> 'status') IS DISTINCT FROM 'boolean' THEN
                RAISE EXCEPTION 'Invalid variant status';
            END IF;

            INSERT INTO variant (question_id, variant_text)
            VALUES (v_question_id, variant_rec->>'text')
            RETURNING variant_id INTO v_variant_id;

            IF (variant_rec ->> 'status')::boolean THEN
                INSERT INTO answer (question_id, variant_id)
                VALUES (v_question_id, v_variant_id);
            END IF;
        END LOOP;
    END LOOP;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END;
$$;
