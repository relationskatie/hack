-- дельты из кумулятивов (VIEW)
CREATE OR REPLACE VIEW analytics_private.fines_daily_delta AS
SELECT
  dt,
  GREATEST(0, violations_cum - COALESCE(LAG(violations_cum) OVER (ORDER BY dt), 0)) AS violations,
  GREATEST(0, rulings_cum    - COALESCE(LAG(rulings_cum)    OVER (ORDER BY dt), 0)) AS rulings,
  GREATEST(0, imposed_cum    - COALESCE(LAG(imposed_cum)    OVER (ORDER BY dt), 0)) AS imposed,
  GREATEST(0, collected_cum  - COALESCE(LAG(collected_cum)  OVER (ORDER BY dt), 0)) AS collected
FROM analytics_private.fines_daily
ORDER BY dt;

-- публичные представления (без денег)
CREATE OR REPLACE VIEW analytics_public.v_fines AS
SELECT f.dt,
       f.violations_cum,
       f.rulings_cum,
       d.violations AS violations_delta,
       d.rulings    AS rulings_delta
FROM analytics_private.fines_daily f
JOIN analytics_private.fines_daily_delta d USING (dt);

CREATE OR REPLACE VIEW analytics_public.v_evac AS
SELECT dt, trucks_on_line, trips, evacuations
FROM analytics_private.evac_daily;

CREATE OR REPLACE VIEW analytics_public.v_mvd_accidents AS
SELECT date_from, date_to, injured_accidents, fatalities, injured_persons
FROM analytics_private.mvd_accidents;
