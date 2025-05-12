import { OpenAPIRoute } from 'chanfana';
import { Context } from 'hono';
import { z } from 'zod';

import Stripe from 'stripe';
import { createOrder, finalizeOrder, updateOrderSessionId, updateOrderStatus } from '../d1/payment';

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
                        })
                    }
                }
            }
        },
        responses: {
            '200': {
                description: 'User info',
                content: {
                    'application/json': {
                        schema: z.object({
                            success: z.boolean(),
                            user: z.object({
                                api_key: z.string(),
                                api_key_enabled: z.boolean(),
                                balance: z.number()
                            })
                        })
                    }
                }
            }
        }
    };

    async handle(c: Context) {
        const env = c.env;
        const userId = c.get('userId');
        const params = await c.req.json();
        const stripe = getStripe(env);

        if (params.amount < 5) {
            return c.json({
                success: false,
                error: 'Invalid amount'
            }, 400);
        }
        await createOrder(env, userId, params.amount);

        let options: Stripe.Checkout.SessionCreateParams = {
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
            success_url: `${env.MYSTA_PUBLIC_DOMAIN}/profile`,
            cancel_url: `${env.MYSTA_PUBLIC_DOMAIN}/profile`,
            metadata: {
                orderId: params.orderId,
                userId: userId,
                userEmail: c.get('userEmail')
            },
        }
        options.customer_email = c.get('userEmail');
        const session = await stripe.checkout.sessions.create(options);
        await updateOrderSessionId(env, params.orderId, session.id);

        return c.json({
            success: true,
            session_id: session.id,
        });
    }
}

export const webCrypto = Stripe.createSubtleCryptoProvider();

export class StripeWebhook extends OpenAPIRoute {
    schema = {
        request: {
            body: {
                content: {
                    'application/json': {
                        schema: z.object({
                            amount: z.number().min(5),
                        })
                    }
                }
            }
        },
        responses: {
            '200': {
                description: 'User info',
                content: {
                    'application/json': {
                        schema: z.object({
                            success: z.boolean(),
                            user: z.object({
                                api_key: z.string(),
                                api_key_enabled: z.boolean(),
                                balance: z.number()
                            })
                        })
                    }
                }
            }
        }
    };

    async handle(c: Context) {
        const stripe = getStripe(c.env)
        const body = await c.req.text();
        const sig = c.req.header('stripe-signature')
        const event = await stripe.webhooks.constructEventAsync(
            body,
            sig,
            c.env.STRIPE_ENDPOINT_SECRET,
            undefined,
            webCrypto
          );

        switch (event.type) {
            case 'checkout.session.completed':
                const completed = event.data.object as Stripe.Checkout.Session;
                await updateOrderStatus(c.env, completed.metadata?.orderId, "completed");
                break;
            case 'checkout.session.expired':
                const expired = event.data.object as Stripe.Checkout.Session;
                await updateOrderStatus(c.env, expired.metadata?.orderId, "cancelled");
                break;
            case "payment_intent.canceled":
                const canceled = event.data.object as Stripe.PaymentIntent;
                await updateOrderStatus(c.env, canceled.metadata?.orderId, "cancelled");
                break;
            case 'payment_intent.succeeded':
                const succeeded = event.data.object as Stripe.PaymentIntent;
                await finalizeOrder(c.env, succeeded.metadata?.orderId);
                break;
            case "payment_intent.payment_failed":
                const failed = event.data.object as Stripe.PaymentIntent;
                await updateOrderStatus(c.env, failed.metadata?.orderId, "failed");
                break;
            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        return c.json({
            received: true,
        });
    }
}   