#!/bin/sh
# Integration test for the registration + payment flow.
# Starts a mock Supabase/Razorpay server and the built app, then replays
# forged, failed, cancelled, duplicate and genuine payments against it.
# Usage: npm run build && npm run test:payments
set -e
cd "$(dirname "$0")/.."
node tests/mock-services.mjs & MOCK=$!
PORT=3418 SUPABASE_URL=http://localhost:3999 SUPABASE_SERVICE_ROLE_KEY=svc \
  RAZORPAY_KEY_ID=rzp_test_x RAZORPAY_KEY_SECRET=test_secret RAZORPAY_WEBHOOK_SECRET=wh_secret \
  RAZORPAY_API_BASE=http://localhost:3999/v1 npx next start -p 3418 >/dev/null 2>&1 & APP=$!
trap 'kill $MOCK $APP 2>/dev/null' EXIT
for i in $(seq 1 40); do curl -s -o /dev/null http://localhost:3418/ && break; sleep 0.5; done
node tests/payment-flow.mjs
