CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL,             
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    description TEXT,
    location TEXT,
    schedule_date TIMESTAMP WITH TIME ZONE, 
    scheduled_start_time TIMESTAMP WITH TIME ZONE,
    scheduled_end_time TIMESTAMP WITH TIME ZONE,
    status INT NOT NULL DEFAULT 1,         
    created_at TIMESTAMP,
    updated_at TIMESTAMP 
);

CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
