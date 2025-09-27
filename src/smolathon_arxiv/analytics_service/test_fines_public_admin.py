import json
from datetime import date
from sqlalchemy import create_engine
from app.services.compare_service import compare_periods

#DSN = "postgresql+psycopg2://user:pass@localhost:5432/city"
ENG = create_engine(DSN, future=True)
pp = lambda x: print(json.dumps(x, ensure_ascii=False, indent=2))

with ENG.begin() as conn:
    print("\n=== COMPARE (evacuations Jan-2025 vs Jan-2024) ===")
    c = compare_periods(conn, "evacuations",
                        period_a_start=date(2025,1,1), period_a_end=date(2025,1,31),
                        period_b_start=date(2024,1,1), period_b_end=date(2024,1,31),
                        is_admin=False)
    pp(c)
    assert c["metric"] == "evacuations"
    assert "sum" in c["period_a"] and "sum" in c["period_b"]
    # diff.abs = A - B
    assert c["diff"]["abs"] == c["period_a"]["sum"] - c["period_b"]["sum"]
    print("OK: compare basic checks passed")

    print("\n=== COMPARE (fatalities 2014 vs 2015) ===")
    c2 = compare_periods(conn, "fatalities",
                         period_a_start=date(2014,1,1), period_a_end=date(2014,12,31),
                         period_b_start=date(2015,1,1), period_b_end=date(2015,12,31),
                         is_admin=False)
    pp(c2)
    assert c2["metric"] == "fatalities"
    assert c2["period_a"]["avg"] is None and c2["period_b"]["avg"] is None  # МВД-ряд
    print("OK: compare for MVD metrics has avg=None as expected")
