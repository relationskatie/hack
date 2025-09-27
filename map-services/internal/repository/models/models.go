package models

type Item struct {
	ID     int64
	Title  string
	Status string
	Type   string
}

type TrafficLight struct {
	ID               int64
	Address          string
	Type             string
	YearInstallation int32
}
