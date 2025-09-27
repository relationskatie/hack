from sqlalchemy import text

def get_mvd_timeseries(conn, date_from, date_to, is_admin=False):
    q = """
    WITH prepared AS (
      SELECT
        date_trunc('month', date_to)::date AS period,        -- ключ месяца = конец окна
        EXTRACT(YEAR FROM date_to)::int     AS y,
        injured_accidents,
        fatalities,
        injured_persons
      FROM analytics_private.mvd_accidents
      -- Хватаем все записи с начала года from_date до конца окна,
      -- чтобы LAG для первого месяца в диапазоне работал корректно
      WHERE date_to >= date_trunc('year', :date_from)
        AND date_to <= :date_to
    ),
    monthly AS (
      -- ОДНА СТРОКА НА МЕСЯЦ: берём максимальный кумулятив в месяце
      SELECT
        period, y,
        MAX(injured_accidents)::bigint AS ia_cum,
        MAX(fatalities)::bigint        AS ft_cum,
        MAX(injured_persons)::bigint   AS ip_cum
      FROM prepared
      GROUP BY period, y
    ),
    deltas AS (
      SELECT
        period,
        GREATEST(0, ia_cum - COALESCE(LAG(ia_cum) OVER (PARTITION BY y ORDER BY period), 0))::int AS injured_accidents,
        GREATEST(0, ft_cum - COALESCE(LAG(ft_cum) OVER (PARTITION BY y ORDER BY period), 0))::int AS fatalities,
        GREATEST(0, ip_cum - COALESCE(LAG(ip_cum) OVER (PARTITION BY y ORDER BY period), 0))::int AS injured_persons
      FROM monthly
    )
    SELECT period, injured_accidents, fatalities, injured_persons
    FROM deltas
    WHERE period BETWEEN :date_from AND :date_to
    ORDER BY period;
    """
    rows = conn.execute(text(q), {"date_from": date_from, "date_to": date_to}).mappings().all()

    series = {
        "injured_accidents": [{"period": r["period"].isoformat(), "value": int(r["injured_accidents"])} for r in rows],
        "fatalities":        [{"period": r["period"].isoformat(), "value": int(r["fatalities"])}        for r in rows],
        "injured_persons":   [{"period": r["period"].isoformat(), "value": int(r["injured_persons"])}   for r in rows],
    }
    aggregates = {
        "sum": {
            "injured_accidents": int(sum(r["injured_accidents"] for r in rows)),
            "fatalities":        int(sum(r["fatalities"] for r in rows)),
            "injured_persons":   int(sum(r["injured_persons"] for r in rows)),
        }
    }
    return {"series": series, "aggregates": aggregates, "meta": {"group_by": "month", "admin": is_admin}}
