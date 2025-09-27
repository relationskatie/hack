CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tittle varchar NOT NULL,                     
    price NUMERIC(12,2) NOT NULL,
    description TEXT,
    need_scheduler BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);




