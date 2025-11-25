// @ts-nocheck
/**
 * Stripe Webhook Handler
 * Processes payment confirmation events and adds credits to user accounts
 * IMPORTANT: Webhook signature verification prevents fraudulent credit additions
 */

import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    // 1. Get raw body for signature verification
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: { code: 'MISSING_SIGNATURE', message: 'Missing Stripe signature' } },
        { status: 400 }
      )
    }

    // 2. Verify webhook signature
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET is not configured')
      return NextResponse.json(
        { error: { code: 'CONFIG_ERROR', message: 'Webhook secret not configured' } },
        { status: 500 }
      )
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_SIGNATURE',
            message: 'Webhook signature verification failed',
          },
        },
        { status: 400 }
      )
    }

    // 3. Handle checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session

      // Extract metadata
      const userId = session.metadata?.userId
      const credits = session.metadata?.credits
      const packageId = session.metadata?.packageId
      const stripeSessionId = session.id

      if (!userId || !credits) {
        console.error('Missing metadata in webhook:', { userId, credits })
        return NextResponse.json(
          { error: { code: 'MISSING_METADATA', message: 'Invalid session metadata' } },
          { status: 400 }
        )
      }

      const creditsToAdd = parseInt(credits, 10)

      // 4. Initialize Supabase client with service role (bypasses RLS for webhooks)
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

      if (!supabaseUrl || !supabaseServiceKey) {
        console.error('Missing Supabase environment variables')
        return NextResponse.json(
          { error: { code: 'CONFIG_ERROR', message: 'Supabase not configured' } },
          { status: 500 }
        )
      }

      const supabase = createClient(supabaseUrl, supabaseServiceKey)

      // 5. Check for duplicate processing (idempotency)
      const { data: existingTransaction } = await supabase
        .from('credit_transaction')
        .select('id')
        .eq('stripe_session_id', stripeSessionId)
        .single()

      if (existingTransaction) {
        console.log('Webhook already processed (idempotent):', stripeSessionId)
        return NextResponse.json({ received: true })
      }

      // 6. Atomically add credits using stored procedure
      // This ensures both credit balance update and transaction log are created atomically
      const { data: transaction, error: addCreditsError } = await supabase.rpc(
        'add_credits',
        {
          p_user_id: userId,
          p_amount: creditsToAdd,
          p_description: `Credit purchase: ${packageId} package`,
          p_stripe_session_id: stripeSessionId,
        }
      )

      if (addCreditsError) {
        console.error('Failed to add credits:', addCreditsError)
        return NextResponse.json(
          {
            error: {
              code: 'ADD_CREDITS_FAILED',
              message: 'Failed to add credits',
              details: addCreditsError.message,
            },
          },
          { status: 500 }
        )
      }

      console.log('Credits added successfully:', {
        userId,
        credits: creditsToAdd,
        newBalance: transaction.balance_after,
        stripeSessionId,
        transactionId: transaction.id,
      })
    }

    // 9. Return success
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      {
        error: {
          code: 'WEBHOOK_ERROR',
          message: 'Webhook processing failed',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    )
  }
}
