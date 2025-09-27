package analitic_client

import (
	"context"
	"encoding/base64"
	"fmt"

	"github.com/hackathonsrus/Smolathon_defer_panic_159/tree/main/api-gateway/config"
	"github.com/hackathonsrus/Smolathon_defer_panic_159/tree/main/api-gateway/internal/controller/models"
	analytics "github.com/hackathonsrus/Smolathon_defer_panic_159/tree/main/api-gateway/proto/analitic"
	"go.uber.org/zap"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

type Analitic interface {
	GetFines(req models.FinesRequest) (*models.FinesResponse, error)
	GetEvac(req models.EvacRequest) (*models.EvacResponse, error)
	GetDtp(req models.DtpRequest) (*models.DtpResponse, error)
	Compare(req models.CompareRequest) (*models.CompareResponse, error)
	GetForecast(req models.GetForecastRequest) (*models.GetForecastResponse, error)
	ImportBytes(req models.ImportBytesRequest) (*models.ImportBytesResponse, error)
}

type Client struct {
	cfg *config.Config
	api analytics.AnalyticsServiceClient
	log *zap.Logger
	ctx context.Context
}

func New(
	ctx context.Context,
	log *zap.Logger,
	cfg *config.Config,
) (*Client, error) {
	opts := []grpc.DialOption{
		grpc.WithTransportCredentials(insecure.NewCredentials()),
		grpc.WithBlock(),
	}

	addr := fmt.Sprintf("%s:%d", cfg.AnaliticService.Host, cfg.AnaliticService.Port)
	conn, err := grpc.DialContext(ctx, addr, opts...)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to %s: %w", addr, err)
	}

	return &Client{
		api: analytics.NewAnalyticsServiceClient(conn),
		log: log,
		ctx: ctx,
		cfg: cfg,
	}, nil
}

func (c *Client) GetFines(req models.FinesRequest) (*models.FinesResponse, error) {
	pbReq := &analytics.FinesRequest{
		Range: &analytics.DateRange{
			FromDate: req.Range.FromDate,
			ToDate:   req.Range.ToDate,
		},
		GroupBy: req.GroupBy,
		Public:  req.Public,
	}

	resp, err := c.api.GetFines(c.ctx, pbReq)
	if err != nil {
		return nil, fmt.Errorf("failed to call GetFines: %w", err)
	}

	result := &models.FinesResponse{
		Series: make(map[string]models.Series),
		Aggregates: models.Aggregates{
			Sum: make(map[string]int64),
			Avg: make(map[string]float64),
		},
		KPI: models.KPI{},
		Meta: models.Meta{
			GroupBy: resp.Meta.GetGroupBy(),
			Admin:   resp.Meta.GetAdmin(),
		},
	}

	for key, s := range resp.Series {
		var points []models.Point
		for _, p := range s.GetPoints() {
			points = append(points, models.Point{
				Dt:    p.GetDt(),
				Value: float64(p.GetValue()),
			})
		}
		result.Series[key] = models.Series{Points: points}
	}

	if resp.Aggregates != nil {
		for k, v := range resp.Aggregates.Sum {
			result.Aggregates.Sum[k] = v
		}
		for k, v := range resp.Aggregates.Avg {
			result.Aggregates.Avg[k] = v
		}
	}

	if resp.Kpi != nil {
		result.KPI = models.KPI{
			CollectionRate: resp.Kpi.GetCollectionRate(),
		}
	}

	return result, nil
}

func (c *Client) GetEvac(req models.EvacRequest) (*models.EvacResponse, error) {
	pbReq := &analytics.EvacRequest{
		Range: &analytics.DateRange{
			FromDate: req.Range.FromDate,
			ToDate:   req.Range.ToDate,
		},
		GroupBy: req.GroupBy,
		Public:  req.Public,
	}

	resp, err := c.api.GetEvac(c.ctx, pbReq)
	if err != nil {
		return nil, fmt.Errorf("failed to call GetEvac: %w", err)
	}

	result := &models.EvacResponse{
		Series: make(map[string]models.Series),
		Aggregates: models.Aggregates{
			Sum: make(map[string]int64),
			Avg: make(map[string]float64),
		},
		Meta: models.Meta{
			GroupBy: resp.Meta.GetGroupBy(),
			Admin:   resp.Meta.GetAdmin(),
		},
	}

	for key, s := range resp.Series {
		var points []models.Point
		for _, p := range s.GetPoints() {
			points = append(points, models.Point{
				Dt:    p.GetDt(),
				Value: float64(p.GetValue()),
			})
		}
		result.Series[key] = models.Series{Points: points}
	}

	if resp.Aggregates != nil {
		for k, v := range resp.Aggregates.Sum {
			result.Aggregates.Sum[k] = v
		}
		for k, v := range resp.Aggregates.Avg {
			result.Aggregates.Avg[k] = v
		}
	}

	return result, nil
}

func (c *Client) GetDtp(req models.DtpRequest) (*models.DtpResponse, error) {
	pbReq := &analytics.DtpRequest{
		Range: &analytics.DateRange{
			FromDate: req.Range.FromDate,
			ToDate:   req.Range.ToDate,
		},
	}

	resp, err := c.api.GetDtp(c.ctx, pbReq)
	if err != nil {
		return nil, fmt.Errorf("failed to call GetDtp: %w", err)
	}

	result := &models.DtpResponse{
		Series: make(map[string]models.Series),
		Aggregates: models.Aggregates{
			Sum: make(map[string]int64),
			Avg: make(map[string]float64),
		},
		Meta: models.Meta{
			GroupBy: "month",
		},
	}

	for key, s := range resp.Series {
		var points []models.Point
		for _, p := range s.GetPoints() {
			points = append(points, models.Point{
				Period: p.GetPeriod(),
				Value:  float64(p.GetValue()),
			})
		}
		result.Series[key] = models.Series{Points: points}
	}

	if resp.Aggregates != nil {
		for k, v := range resp.Aggregates.Sum {
			result.Aggregates.Sum[k] = v
		}
		for k, v := range resp.Aggregates.Avg {
			result.Aggregates.Avg[k] = v
		}
	}

	return result, nil
}

func (c *Client) Compare(req models.CompareRequest) (*models.CompareResponse, error) {
	pbReq := &analytics.CompareRequest{
		Metric: req.Metric,
		PeriodA: &analytics.DateRange{
			FromDate: req.PeriodA.FromDate,
			ToDate:   req.PeriodA.ToDate,
		},
		PeriodB: &analytics.DateRange{
			FromDate: req.PeriodB.FromDate,
			ToDate:   req.PeriodB.ToDate,
		},
		Public: req.Public,
	}

	resp, err := c.api.Compare(c.ctx, pbReq)
	if err != nil {
		return nil, fmt.Errorf("failed to call Compare: %w", err)
	}

	result := &models.CompareResponse{
		Metric: resp.GetMetric(),
		PeriodA: models.PeriodAgg{
			FromDate: resp.GetPeriodA().GetFromDate(),
			ToDate:   resp.GetPeriodA().GetToDate(),
			Sum:      resp.GetPeriodA().GetSum(),
			Avg:      resp.GetPeriodA().GetAvg(),
			AvgSet:   resp.GetPeriodA().GetAvgSet(),
		},
		PeriodB: models.PeriodAgg{
			FromDate: resp.GetPeriodB().GetFromDate(),
			ToDate:   resp.GetPeriodB().GetToDate(),
			Sum:      resp.GetPeriodB().GetSum(),
			Avg:      resp.GetPeriodB().GetAvg(),
			AvgSet:   resp.GetPeriodB().GetAvgSet(),
		},
		Diff: models.Diff{
			SumDiff: resp.Diff.Abs,
			AvgDiff: resp.Diff.Rel,
		},
		Admin: resp.GetAdmin(),
	}

	return result, nil
}

func (c *Client) GetForecast(req models.GetForecastRequest) (*models.GetForecastResponse, error) {
	pbReq := &analytics.GetForecastRequest{
		Metric:  req.Metric,
		Horizon: req.Horizon,
	}

	resp, err := c.api.GetForecast(c.ctx, pbReq)
	if err != nil {
		return nil, fmt.Errorf("failed to call GetForecast: %w", err)
	}

	result := &models.GetForecastResponse{
		TrainRange: models.DateRange{
			FromDate: resp.GetTrainRange().GetFromDate(),
			ToDate:   resp.GetTrainRange().GetToDate(),
		},
		Freq: resp.GetFreq(),
	}

	for _, p := range resp.GetForecast() {
		result.Forecast = append(result.Forecast, models.ForecastPoint{
			Ds:        p.GetDs(),
			Yhat:      p.GetYhat(),
			YhatLower: p.GetYhatLower(),
			YhatUpper: p.GetYhatUpper(),
		})
	}

	for _, h := range resp.GetLastHistory() {
		result.LastHistory = append(result.LastHistory, models.HistoryPoint{
			Ds: h.GetDs(),
			Y:  h.GetY(),
		})
	}

	meta := resp.GetMeta()
	var cv *models.CrossValidationInfo
	if meta.GetCv() != nil {
		cv = &models.CrossValidationInfo{
			MAE:   meta.GetCv().GetMae(),
			SMAPE: meta.GetCv().GetSmape(),
			MAPE:  meta.GetCv().GetMape(),
		}
	}

	result.Meta = models.MetaInfo{
		Metric:  meta.GetMetric(),
		Horizon: meta.GetHorizon(),
		CV:      cv,
	}

	return result, nil
}

func (c *Client) ImportBytes(req models.ImportBytesRequest) (*models.ImportBytesResponse, error) {
	pbFiles := make([]*analytics.FilePayload, len(req.Files))
	for i, f := range req.Files {
		data, err := base64.StdEncoding.DecodeString(f.Content)
		if err != nil {
			return nil, fmt.Errorf("failed to decode base64 for file %s: %w", f.Filename, err)
		}

		pbFiles[i] = &analytics.FilePayload{
			Filename: f.Filename,
			Content:  data,
		}

	}

	pbReq := &analytics.ImportBytesRequest{
		Files: pbFiles,
		Mode:  req.Mode,
	}

	resp, err := c.api.ImportBytes(c.ctx, pbReq)
	if err != nil {
		return nil, fmt.Errorf("failed to call ImportBytes: %w", err)
	}

	return &models.ImportBytesResponse{
		Status:      resp.GetStatus(),
		SummaryJSON: resp.GetSummaryJson(),
	}, nil
}
