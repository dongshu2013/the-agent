# Stripe Integration Setup

This document provides instructions for setting up Stripe integration for one-time payments.

## Environment Variables

Add the following environment variables to your `.env` file:

```
# Stripe API Keys
STRIPE_PUBLIC_KEY=pk_test_your_stripe_publishable_key
STRIPE_PRIVATE_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret

# App URL for Stripe redirects
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Stripe Setup

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your API keys from the Stripe Dashboard
3. Set up a webhook endpoint in the Stripe Dashboard:
   - URL: `https://your-domain.com/api/webhook`
   - Events to listen for: `checkout.session.completed`
4. Get the webhook signing secret and add it to your environment variables

## Testing

1. Use Stripe's test cards for testing payments:

   - Card number: `4242 4242 4242 4242`
   - Expiration date: Any future date
   - CVC: Any 3 digits
   - ZIP: Any 5 digits

2. After successful payment, the user's credits will be updated automatically.
