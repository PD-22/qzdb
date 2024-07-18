const { readFile } = require("fs/promises");
const { resolve } = require("path");
const { Client } = require("pg");
const { z } = require("zod");

const client = new Client({
    password: '25baYvi',
    user: 'postgres',
    database: 'postgres',
    host: 'localhost',
    port: 5432,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
});
client.on('notice', x => console.log(x.message));

const quizSchema = z.array(z.object({
    title: z.string(),
    description: z.string(),
    tests: z.array(z.object({
        question: z.string(),
        variants: z.array(z.object({
            text: z.string(),
            status: z.boolean()
        })),
    }))
}));

(async () => {
    try {
        await client.connect();

        const path = resolve(__dirname, 'quizzes.json');
        const data = await readFile(path, 'utf8');
        const quizzes = quizSchema.parse(JSON.parse(data));
        console.log('quizzes', JSON.stringify(quizzes, null, 2));

        await Promise.all(quizzes.map(quiz => client.query('CALL create_quiz($1)', [quiz])));
    } finally {
        await client.end();
    }
})();
