CREATE SCHEMA IF NOT EXISTS analytics_private;
CREATE SCHEMA IF NOT EXISTS analytics_public;

-- штрафы: ежедневные кумулятивы
CREATE TABLE IF NOT EXISTS analytics_private.fines_daily (
  dt               date PRIMARY KEY,
  violations_cum   integer,
  rulings_cum      integer,
  imposed_cum      bigint,
  collected_cum    bigint
);
CREATE INDEX IF NOT EXISTS ix_fines_daily_dt ON analytics_private.fines_daily (dt);

-- эвакуации: ежедневные некумулятивные
CREATE TABLE IF NOT EXISTS analytics_private.evac_daily (
  dt               date PRIMARY KEY,
  trucks_on_line   integer,
  trips            integer,
  evacuations      integer,
  impound_income   bigint
);
CREATE INDEX IF NOT EXISTS ix_evac_daily_dt ON analytics_private.evac_daily (dt);

-- МВД: периодические записи
CREATE TABLE IF NOT EXISTS analytics_private.mvd_accidents (
  period_raw        text PRIMARY KEY,
  date_from         date,
  date_to           date,
  injured_accidents integer,
  fatalities        integer,
  injured_persons   integer
);
CREATE INDEX IF NOT EXISTS ix_mvd_accidents_range
  ON analytics_private.mvd_accidents (date_from, date_to);
