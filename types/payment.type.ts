export interface Payment {
    id: string
    user_id: string
    course_id?: string | null
    amount: number
    currency?: string | null
    payment_channel: string
    transaction_id?: string | null
    status: 'pending' | 'successful' | 'failed' | 'refunded'
    paid_at?: string | null
    created_at: string
    updated_at?: string | null
    is_verified?: boolean | null
    type?: string | null
    purpose?: string | null
    workshop_id?: string | null
    book_id?: string | null
    bkash_payment_id?: string | null
    bkash_intent_id?: string | null
    bkash_url?: string | null
    course?: { id: string; title: string; slug: string } | null
    workshop?: { id: string; title: string; slug: string } | null
    book?: { id: string; title: string; slug: string } | null
  }