package models

type Point struct {
	// Используется одно из полей: Dt для штрафов/эвакуаций, Period для МВД
	Dt     string  `json:"dt,omitempty"`     // YYYY-MM-DD
	Period string  `json:"period,omitempty"` // YYYY-MM-01
	Value  float64 `json:"value"`
}

type Series struct {
	Points []Point `json:"points"`
}

type Aggregates struct {
	Sum map[string]int64   `json:"sum,omitempty"`
	Avg map[string]float64 `json:"avg,omitempty"`
}

type KPI struct {
	CollectionRate float64 `json:"collection_rate,omitempty"`
}

type Meta struct {
	GroupBy string `json:"group_by"`
	Admin   bool   `json:"admin"`
}

type FinesResponse struct {
	Series     map[string]Series `json:"series"`
	Aggregates Aggregates        `json:"aggregates"`
	KPI        KPI               `json:"kpi,omitempty"`
	Meta       Meta              `json:"meta"`
}

type DateRange struct {
	FromDate string `json:"from_date"`
	ToDate   string `json:"to_date"`
}

type FinesRequest struct {
	Range   DateRange `json:"range"`
	GroupBy string    `json:"group_by,omitempty"` // day|week|month
	Public  bool      `json:"public,omitempty"`
}

type EvacRequest struct {
	Range   DateRange `json:"range"`
	GroupBy string    `json:"group_by,omitempty"` // day|week|month
	Public  bool      `json:"public,omitempty"`   // true = guest, false = admin
}

type EvacResponse struct {
	Series     map[string]Series `json:"series"`     // trucks_on_line, trips, evacuations, (admin) impound_income
	Aggregates Aggregates        `json:"aggregates"` // суммы и средние
	Meta       Meta              `json:"meta"`
}

type DtpRequest struct {
	Range DateRange `json:"range"`
}

type DtpResponse struct {
	Series     map[string]Series `json:"series"`     // injured_accidents, fatalities, injured_persons
	Aggregates Aggregates        `json:"aggregates"` // суммы по сериям
	Meta       Meta              `json:"meta"`       // group_by всегда "month"
}

type CompareRequest struct {
	Metric  string    `json:"metric"`
	PeriodA DateRange `json:"period_a"`
	PeriodB DateRange `json:"period_b"`
	Public  bool      `json:"public,omitempty"`
}

type CompareResponse struct {
	Metric  string    `json:"metric"`
	PeriodA PeriodAgg `json:"period_a"`
	PeriodB PeriodAgg `json:"period_b"`
	Diff    Diff      `json:"diff"`
	Admin   bool      `json:"admin"`
}

type PeriodAgg struct {
	FromDate string  `json:"from_date"`
	ToDate   string  `json:"to_date"`
	Sum      int64   `json:"sum"`
	Avg      float64 `json:"avg"`
	AvgSet   bool    `json:"avg_set"`
}

type Diff struct {
	SumDiff int64   `json:"sum_diff"`
	AvgDiff float64 `json:"avg_diff"`
}

type GetForecastRequest struct {
	Metric  string `json:"metric"`            // "injured_accidents" или "evacuations"
	Horizon int32  `json:"horizon,omitempty"` // опционально
}

type ForecastPoint struct {
	Ds        string  `json:"ds"`         // дата "YYYY-MM-DD"
	Yhat      float64 `json:"yhat"`       // прогноз
	YhatLower float64 `json:"yhat_lower"` // нижняя граница
	YhatUpper float64 `json:"yhat_upper"` // верхняя граница
}

type HistoryPoint struct {
	Ds string  `json:"ds"` // дата
	Y  float64 `json:"y"`  // фактическое значение
}

type CrossValidationInfo struct {
	MAE   float64 `json:"mae"`
	SMAPE float64 `json:"smape"`
	MAPE  float64 `json:"mape,omitempty"`
}

type MetaInfo struct {
	Metric  string               `json:"metric"`
	Horizon int32                `json:"horizon"`
	CV      *CrossValidationInfo `json:"cv,omitempty"`
}

type GetForecastResponse struct {
	TrainRange  DateRange       `json:"train_range"`
	Freq        string          `json:"freq"` // "day" или "month"
	Forecast    []ForecastPoint `json:"forecast"`
	LastHistory []HistoryPoint  `json:"last_history"`
	Meta        MetaInfo        `json:"meta"`
}

type FilePayload struct {
	Filename string `json:"filename,omitempty"`
	Content  string `json:"content"` // бинарные данные
}

type ImportBytesRequest struct {
	Files []FilePayload `json:"files"`          // хотя можно и один файл
	Mode  string        `json:"mode,omitempty"` // "append" по умолчанию, или "replace"
}
type ImportBytesResponse struct {
	Status      string `json:"status"`       // "ok" при успехе
	SummaryJSON string `json:"summary_json"` // JSON со статистикой импорта
}
