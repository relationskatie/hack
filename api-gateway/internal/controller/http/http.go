package http

import (
	"context"
	"fmt"
	"net/http"

	"github.com/hackathonsrus/Smolathon_defer_panic_159/tree/main/api-gateway/config"
	analitic_client "github.com/hackathonsrus/Smolathon_defer_panic_159/tree/main/api-gateway/internal/clients/analitic"
	content_client "github.com/hackathonsrus/Smolathon_defer_panic_159/tree/main/api-gateway/internal/clients/content"
	location_client "github.com/hackathonsrus/Smolathon_defer_panic_159/tree/main/api-gateway/internal/clients/location"
	order_clinet "github.com/hackathonsrus/Smolathon_defer_panic_159/tree/main/api-gateway/internal/clients/order"
	"github.com/hackathonsrus/Smolathon_defer_panic_159/tree/main/api-gateway/internal/repository"
	"github.com/labstack/echo"
	"github.com/labstack/echo/middleware"
	"go.uber.org/zap"
)

type Controller struct {
	ctx            context.Context
	cfg            *config.Config
	serv           *echo.Echo
	log            *zap.Logger
	contentClient  content_client.Content
	orderClient    order_clinet.Order
	analiticClient analitic_client.Analitic
	locationClient location_client.Location
	repo           repository.RepositoryInterface
}

func New(ctx context.Context, cfg *config.Config, log *zap.Logger, contentClient content_client.Content, orderClient order_clinet.Order, analiticClient analitic_client.Analitic, locationClient location_client.Location, repo repository.RepositoryInterface) (*Controller, error) {
	ctrl := &Controller{
		ctx:            ctx,
		cfg:            cfg,
		serv:           echo.New(),
		log:            log,
		contentClient:  contentClient,
		orderClient:    orderClient,
		analiticClient: analiticClient,
		locationClient: locationClient,
		repo:           repo,
	}
	ctrl.configureMiddleware()
	api := ctrl.serv.Group("/api")

	news := api.Group("/news")
	{
		news.POST("", ctrl.handleCreateNews)        // POST /api/news
		news.GET("/:id", ctrl.handleGetNews)        // GET /api/news/:id
		news.PUT("/:id", ctrl.handleUpdateNews)     // PUT /api/news/:id
		news.DELETE("/:id", ctrl.handleDeleteNews)  // DELETE /api/news/:id
		news.GET("", ctrl.handleListNews)           // GET /api/news?limit=&offset=
		news.GET("/count", ctrl.handleGetCountNews) // GET /api/news/count
	}

	vacancies := api.Group("/vacancies")
	{
		vacancies.POST("", ctrl.handleCreateVacancy)             // POST /api/vacancies
		vacancies.GET("/:id", ctrl.handleGetVacancy)             // GET /api/vacancies/:id
		vacancies.PUT("/:id", ctrl.handleUpdateVacancy)          // PUT /api/vacancies/:id
		vacancies.DELETE("/:id", ctrl.handleDeleteVacancy)       // DELETE /api/vacancies/:id
		vacancies.GET("", ctrl.handleListAllVacancies)           // GET /api/vacancies?limit=&offset=
		vacancies.GET("/active", ctrl.handleListActiveVacancies) // GET /api/vacancies/active
		vacancies.GET("/count", ctrl.handleGetCountVacancies)    // GET /api/vacancies/count
	}

	docs := api.Group("/documents")
	{
		docs.POST("", ctrl.handleCreateDocument)       // POST /api/documents
		docs.GET("/:id", ctrl.handleGetDocument)       // GET /api/documents/:id
		docs.GET("", ctrl.handleListDocuments)         // GET /api/documents?limit=&offset=
		docs.DELETE("/:id", ctrl.handleDeleteDocument) // DELETE /api/documents/:id
	}

	contacts := api.Group("/contacts")

	{
		contacts.POST("", ctrl.handleCreateContact)       // POST /api/contacts
		contacts.GET("/:id", ctrl.handleGetContact)       // GET /api/contacts/:id
		contacts.GET("", ctrl.handleListContacts)         // GET /api/contacts?limit=&offset=
		contacts.PUT("/:id", ctrl.handleUpdateContact)    // PUT /api/contacts/:id
		contacts.DELETE("/:id", ctrl.handleDeleteContact) // DELETE /api/contacts/:id
	}

	projects := api.Group("/projects")
	{
		projects.POST("", ctrl.handleCreateProject)       // POST /api/projects
		projects.GET("/:id", ctrl.handleGetProject)       // GET /api/projects/:id
		projects.GET("", ctrl.handleListProjects)         // GET /api/projects?limit=&offset=
		projects.PUT("/:id", ctrl.handleUpdateProject)    // PUT /api/projects/:id
		projects.DELETE("/:id", ctrl.handleDeleteProject) // DELETE /api/projects/:id
	}

	services := api.Group("/services")
	{
		services.POST("", ctrl.handleCreateServices)
		services.PUT("/:id", ctrl.handleUpdateServices)
		services.DELETE("/:id", ctrl.handleDeleteService)
		services.GET("/:id", ctrl.handleGetServicesByID)
		services.GET("", ctrl.handleListServices)
	}

	orders := api.Group("/orders")
	{
		orders.POST("", ctrl.handleCreateOrder)
		orders.GET("/user/:id", ctrl.handleGetOrderForUser)
		orders.GET("/:id", ctrl.handleGetOrderByID)
		orders.PATCH("/:id", ctrl.handleCancelOrder)
		orders.PUT("", ctrl.handleUpdateOrderStatus)
		orders.GET("", ctrl.handleListOrders)
		orders.GET("/my", ctrl.handleListMyOrders)
	}

	analitc := api.Group("/analitic")
	{
		analitc.GET("/fines", ctrl.handleGetFines)
		analitc.GET("/evac", ctrl.handleGetEvac)
		analitc.GET("/dtp", ctrl.handleGetDtp)
		analitc.GET("/compare", ctrl.handleCompare)
		analitc.GET("/forecast", ctrl.handleGetForecast)
		analitc.POST("/file", ctrl.handleImportBytes)
	}

	items := api.Group("/items")
	{
		items.GET("/:id", ctrl.handleGetItem)
		items.POST("", ctrl.handleCreateItem)
		items.PUT("/:id", ctrl.handleUpdateItem)
		items.DELETE("/:id", ctrl.handleDeleteItem)
		items.GET("", ctrl.handleListItems)
	}

	trafficLights := api.Group("/traffic_lights")
	{
		trafficLights.POST("", ctrl.handleCreateTrafficLight)
		trafficLights.GET("/:id", ctrl.handleGetTrafficLight)
		trafficLights.DELETE("/:id", ctrl.handleDeleteTrafficLight)
		trafficLights.PUT("/:id", ctrl.handleUpdateTrafficLight)
		trafficLights.GET("", ctrl.handleListTrafficLights)

	}

	api.POST("/login", ctrl.handleLogin)
	api.GET("/role", ctrl.handleGetUserRole)

	return ctrl, nil
}

func (ctrl *Controller) Start() error {
	addres := fmt.Sprintf("%s:%d", ctrl.cfg.APIGateway.Host, ctrl.cfg.APIGateway.Port)
	return ctrl.serv.Start(addres)
}

func (ctrl *Controller) configureMiddleware() {
	ctrl.serv.Use(
		middleware.RequestID(),
		middleware.Recover(),
		middleware.Logger(),
		middleware.CORSWithConfig(middleware.CORSConfig{

			AllowOrigins:     []string{"*"},
			AllowMethods:     []string{http.MethodOptions, http.MethodGet, http.MethodPut, http.MethodPost, http.MethodDelete},
			AllowHeaders:     []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept, echo.HeaderAuthorization},
			AllowCredentials: true,
		}),
	)
}
