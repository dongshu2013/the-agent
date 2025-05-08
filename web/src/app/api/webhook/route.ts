import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from "@/lib/prisma";
import { getUserCredits } from "@/lib/credits";
import { TransactionType, OrderStatus } from "@/lib/constants";

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

    // console.log("stripe notify event: ", event);

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Update order status
        if (session.metadata?.orderId) {
          const order = await prisma.orders.update({
            where: { id: session.metadata.orderId },
            data: { status: OrderStatus.COMPLETED },
          });

          // Add credits to user account
          if (order && session.metadata?.userId) {
            // Get current user credits from the credits table
            const currentCredits = await getUserCredits(session.metadata.userId);
            const orderAmount = parseFloat(order.amount.toString());
            const newUserCredits = currentCredits + orderAmount;
              
            // Record the credit addition in the credits table
            await prisma.credits.create({
              data: {
                user_id: session.metadata.userId,
                order_id: order.id,
                amount: orderAmount,
                trans_credits: orderAmount,
                user_credits: newUserCredits,
                trans_type: TransactionType.ORDER_PAY,
                created_at: new Date(),
              }
            });
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
