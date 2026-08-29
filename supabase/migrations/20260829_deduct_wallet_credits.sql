-- Enforce atomic wallet credit deduction with ledger recording and idempotency protection
CREATE OR REPLACE FUNCTION deduct_wallet_credits(
    p_user_id UUID,
    p_amount NUMERIC,
    p_action_type TEXT,
    p_idempotency_key TEXT,
    p_description TEXT
) RETURNS BOOLEAN AS $$
DECLARE
    current_bal NUMERIC;
BEGIN
    -- Idempotency protection against duplicate retries
    IF p_idempotency_key IS NOT NULL AND EXISTS (
        SELECT 1 FROM wallet_transactions WHERE idempotency_key = p_idempotency_key
    ) THEN
        RETURN TRUE;
    END IF;

    -- Row-level pessimistic lock to prevent race conditions
    SELECT wallet_balance INTO current_bal 
    FROM profiles 
    WHERE id = p_user_id 
    FOR UPDATE;

    IF current_bal IS NULL OR current_bal < p_amount THEN
        RAISE EXCEPTION 'INSUFFICIENT_FUNDS';
    END IF;

    -- Update balance atomically
    UPDATE profiles 
    SET wallet_balance = wallet_balance - p_amount 
    WHERE id = p_user_id;

    -- Write immutable audit ledger entry
    INSERT INTO wallet_transactions (
        user_id, 
        action_type, 
        amount, 
        description, 
        idempotency_key,
        created_at
    )
    VALUES (
        p_user_id, 
        p_action_type, 
        p_amount, 
        p_description, 
        p_idempotency_key,
        NOW()
    );

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
