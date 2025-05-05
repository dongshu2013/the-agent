## Prisma 

1. edit `prisma/schema.prisma` 
2. run `pnpm prisma migrate dev --name <migration_name>` to update local database, `pnpm prisma generate` to generate client code
3. git push will auto trigger railway start command `pnpm prisma migrate deploy & pnpm start` to update remote database 

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


## Database Operations Guidelines

### Environment Setup
1. Ensure PostgreSQL client is installed
2. Configure `.env` file with database connection info:
```bash
DATABASE_URL="postgresql://username:password@host:port/dbname"
```

### Database Schema Change Workflow

1. Create Migration File
   - Create new migration folder in `prisma/migrations/`
   - Naming format: `YYYYMMDDHHMMSS_description`
   - Create `migration.sql` in the folder

2. Write SQL Migration Script
   - Write change SQL in `migration.sql`
   - Include rollback plan in `rollback.sql`
   - Example:
   ```sql
   -- Add new column
   ALTER TABLE table_name ADD COLUMN column_name data_type [constraints];
   ```

3. Execute Migration
   ```bash
   # Execute migration file
   psql -h <host> -p <port> -U <username> -d <dbname> -f prisma/migrations/YYYYMMDDHHMMSS_description/migration.sql

   # Pull latest schema from database
   npx prisma db pull

   # Generate Prisma Client
   npx prisma generate
   ```

### Important Notes
- ⚠️ Do not modify schema.prisma file directly
- ✅ All schema changes must be done via SQL migration files
- 📝 Migration files must have clear change descriptions
- 🔄 Large changes should be executed in batches

### Production Deployment
- Code push to main branch triggers deployment
- Railway automatically executes database migrations
- Test migration scripts in staging environment first

### Troubleshooting
- Migration failure: Check SQL syntax and database connection
- Rollback: Execute corresponding rollback.sql
- Data inconsistency: Use `prisma db pull` to sync latest structure

### Best Practices
- One major change per migration file
- Maintain backward compatibility
- Consider performance impact for large table changes
- Regular cleanup of unused indexes and columns
```
