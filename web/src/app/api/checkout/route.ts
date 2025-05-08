import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY || '');

export async function POST(req: Request) {
  try {
    const { amount, userId, userEmail } = await req.json();

    if (!amount || amount < 5) {
      return NextResponse.json(
        { error: 'Amount must be at least 5' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Create order in database
    const order = await prisma.orders.create({
      data: {
        user_id: userId,
        user_email: userEmail,
        amount: amount,
        status: 'pending',
      },
    });

    let options: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Credits',
              description: `${amount} credits for your account`,
            },
            unit_amount: amount * 100, // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/profile`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/profile`,
      metadata: {
        orderId: order.id,
        userId: userId,
        userEmail: userEmail
      },
    }

    if (userEmail) {
      options.customer_email = userEmail;
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create(options);

    // Update order with Stripe session ID
    await prisma.orders.update({
      where: { id: order.id },
      data: { stripe_session_id: session.id },
    });

    return NextResponse.json(
      { public_key: process.env.STRIPE_PUBLIC_KEY, session_id: session.id, url: session.url }
    );
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
