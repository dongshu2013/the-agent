import { OpenAPIRoute } from 'chanfana';
import { Context } from 'hono';
import { z } from 'zod';

import Stripe from 'stripe';
import { createOrder, finalizeOrder, updateOrderStatus } from '../d1/payment';
import { GatewayServiceError } from '../types/service';
import { OrderStatus } from '../d1/types';

export function getStripe(env: Env) {
  if (!env.STRIPE_PRIVATE_KEY) {
    throw new Error('Can not initialize Stripe without STRIPE_PRIVATE_KEY');
  }
  const client = new Stripe(env.STRIPE_PRIVATE_KEY, {
    httpClient: Stripe.createFetchHttpClient(), // ensure we use a Fetch client, and not Node's `http`
  });
  return client;
}

export class StripeCheckout extends OpenAPIRoute {
  schema = {
    request: {
      body: {
        content: {
          'application/json': {
            schema: z.object({
              amount: z.number().min(5),
            }),
          },
        },
      },
    },
    responses: {
      '200': {
        description: 'User info',
        content: {
          'application/json': {
            schema: z.object({
              order_id: z.string(),
              session_id: z.string(),
              public_key: z.string(),
            }),
          },
        },
      },
    },
  };

  async handle(c: Context) {
    const env = c.env;
    const userId = c.get('userId');
    const params = await c.req.json();
    const stripe = getStripe(env);

    if (params.amount < 5) {
      throw new GatewayServiceError(400, 'invalid amount');
    }
    const orderId = await createOrder(env, userId, params.amount);
    const options: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Credits',
              description: `${params.amount} credits for your account`,
            },
            unit_amount: params.amount * 100, // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer_email: c.get('userEmail'),
      success_url: `${env.MYSTA_PUBLIC_DOMAIN}/profile`,
      cancel_url: `${env.MYSTA_PUBLIC_DOMAIN}/profile`,
      metadata: {
        orderId: orderId,
        userId: userId,
        userEmail: c.get('userEmail'),
      },
    };
    const session = await stripe.checkout.sessions.create(options);
    return c.json({
      order_id: orderId,
      session_id: session.id,
      public_key: env.STRIPE_PUBLIC_KEY,
    });
  }
}

export class StripeWebhook extends OpenAPIRoute {
  schema = {
    responses: {
      '200': {
        description: 'User info',
        content: {
          'application/json': {
            schema: z.object({
              received: z.boolean(),
            }),
          },
        },
      },
    },
  };

  async handle(c: Context) {
    const stripe = getStripe(c.env);
    const body = await c.req.text();
    const sign = c.req.header('stripe-signature') as string;
    const event = await stripe.webhooks.constructEventAsync(
      body,
      sign,
      c.env.STRIPE_WEBHOOK_SECRET
    );

    switch (event.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded':
        const completed = event.data.object as Stripe.Checkout.Session;
        // console.log('---completed:', completed);

        if (!completed.metadata?.orderId || !completed.amount_subtotal) {
          console.log('invalid order id or payment amount');
          return;
        }
        await finalizeOrder(
          c.env,
          completed.metadata.orderId,
          completed.id,
          completed.amount_subtotal
        );
        break;
      case 'checkout.session.expired':
        const expired = event.data.object as Stripe.Checkout.Session;
        if (!expired.metadata?.orderId) {
          console.log('invalid order id');
          return;
        }
        await updateOrderStatus(
          c.env,
          expired.metadata?.orderId,
          expired.id,
          OrderStatus.CANCELLED
        );
        break;
      case 'checkout.session.async_payment_failed':
        const failed = event.data.object as Stripe.Checkout.Session;
        if (!failed.metadata?.orderId) {
          console.log('invalid order id');
          return;
        }
        await updateOrderStatus(
          c.env,
          failed.metadata?.orderId,
          failed.id,
          OrderStatus.FAILED
        );
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
    return c.json({
      received: true,
    });
  }
}
