package models

type CreateTrafficLightRequest struct {
	Address string `json:"address"`
	Type    string `json:"type"`
	Year    int32  `json:"year_installation"`
}

type TrafficLightResponse struct {
	ID               int64  `json:"id"`
	Address          string `json:"address"`
	Type             string `json:"type"`
	YearInstallation int32  `json:"year_installation"`
}
