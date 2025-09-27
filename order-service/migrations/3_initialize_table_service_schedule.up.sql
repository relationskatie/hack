CREATE TABLE IF NOT EXISTS service_schedule (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    user_id UUID NOT NULL, 
    schedule_date DATE NOT NULL,
    start_time TIME NOT NULL, 
    end_time TIME NOT NULL,   
    is_booked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE INDEX idx_service_schedule_service_id ON service_schedule(service_id);
CREATE INDEX idx_service_schedule_date_time ON service_schedule(schedule_date, start_time, end_time);
CREATE INDEX idx_service_schedule_user_id ON service_schedule(user_id);
