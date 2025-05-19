#!/bin/bash

# Execute SQL script locally
echo "Inserting coupon codes to local database..."
npx wrangler d1 execute mysta-staging --file=./scripts/insert_coupons.sql --local

# Execute SQL script on remote D1
echo "Inserting coupon codes to remote database..."
npx wrangler d1 execute mysta-staging --file=./scripts/insert_coupons.sql --remote

# Verify the insertions
echo "Verifying local insertions..."
npx wrangler d1 execute mysta-staging --command="SELECT code, credits, max_uses, used_count, is_active, expired_at FROM coupon_codes;" --local

echo "Verifying remote insertions..."
npx wrangler d1 execute mysta-staging --command="SELECT code, credits, max_uses, used_count, is_active, expired_at FROM coupon_codes;" --remote 