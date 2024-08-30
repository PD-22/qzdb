Setup the Postgres and run the development server:
```bash
cd scripts
psql -U your_username -f init.sql
psql -U your_username -f seed.sql
npm run dev
```

![alt text](demo.png)
