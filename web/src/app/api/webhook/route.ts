import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const stripePrivateKey = process.env.STRIPE_PRIVATE_KEY;
    const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!stripePrivateKey || !stripeWebhookSecret) {
      throw new Error("invalid stripe config");
    }

    const stripe = new Stripe(stripePrivateKey);

    const sign = req.headers.get("stripe-signature") as string;
    const body = await req.text();
    if (!sign || !body) {
      throw new Error("invalid notify data");
    }

    const event = await stripe.webhooks.constructEventAsync(
      body,
      sign,
      stripeWebhookSecret
    );

    console.log("stripe notify event: ", event);

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Update order status
        if (session.metadata?.orderId) {
          const order = await prisma.orders.update({
            where: { id: session.metadata.orderId },
            data: { status: 'completed' },
          });

          // Add credits to user account
          if (order && session.metadata?.userId) {
            // Get current user credits
            const user = await prisma.users.findUnique({
              where: { id: session.metadata.userId },
              select: { credits: true },
            });

            if (user) {
              const currentCredits = parseFloat(user.credits.toString());
              const orderAmount = parseFloat(order.amount.toString());
              
              // Update user credits
              await prisma.users.update({
                where: { id: session.metadata.userId },
                data: { credits: currentCredits + orderAmount },
              });

              // Log the credit addition
              await prisma.credit_logs.create({
                data: {
                  user_id: session.metadata.userId,
                  amount: orderAmount,
                  type: 'addition',
                  description: `Payment completed - Order ID: ${order.id}`,
                  balance: currentCredits + orderAmount,
                },
              });
            }
          }
        }
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  return NextResponse.json({ received: true });
}
