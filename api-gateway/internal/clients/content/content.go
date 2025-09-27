package client_content

import (
	"context"
	"encoding/base64"
	"fmt"

	"github.com/google/uuid"
	"github.com/hackathonsrus/Smolathon_defer_panic_159/tree/main/api-gateway/config"
	"github.com/hackathonsrus/Smolathon_defer_panic_159/tree/main/api-gateway/internal/controller/models"
	"github.com/hackathonsrus/Smolathon_defer_panic_159/tree/main/api-gateway/proto/content"
	"go.uber.org/zap"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

type Content interface {
	CreateNews(req models.CreateNewsRequest) (*models.CreateNewsResponse, error)
	GetNews(req models.GetNewsRequest) (*models.GetNewsResponse, error)
	UpdateNews(req models.UpdateNewsRequest) (*models.UpdateNewsResponse, error)
	DeleteNews(req models.DeleteNewsRequest) (*models.DeleteNewsResponse, error)
	ListNews(req models.ListNewsRequest) (*models.ListNewsResponse, error)
	GetCountNews() (*models.GetCountNewsResponse, error)

	CreateVacancy(req models.CreateVacancyRequest) (*models.CreateVacancyResponse, error)
	GetVacancy(req models.GetVacancyRequest) (*models.GetVacancyResponse, error)
	UpdateVacancy(req models.UpdateVacancyRequest) (*models.UpdateVacancyResponse, error)
	DeleteVacancy(req models.DeleteVacancyRequest) (*models.DeleteVacancyResponse, error)
	ListAllVacancies(req models.ListVacanciesRequest) (*models.ListVacanciesResponse, error)
	ListActiveVacancies(req models.ListVacanciesRequest) (*models.ListVacanciesResponse, error)
	GetCountVacancies() (*models.GetCountVacanciesResponse, error)

	CreateDocument(req models.CreateDocumentRequest) (*models.CreateDocumentResponse, error)
	GetDocument(req models.GetDocumentRequest) (*models.GetDocumentResponse, error)
	ListDocuments(req models.ListDocumentsRequest) (*models.ListDocumentsResponse, error)
	DeleteDocument(req models.DeleteDocumentRequest) error

	CreateContact(req models.ContactCreate) (*models.Contact, error)
	GetContact(id uuid.UUID) (*models.Contact, error)
	ListContacts(limit, offset int32) ([]*models.Contact, error)
	UpdateContact(req models.Contact) (*models.Contact, error)
	DeleteContact(id uuid.UUID) (string, error)

	CreateProject(req models.CreateProjectRequest) (*models.Project, error)
	GetProject(id uuid.UUID) (*models.Project, error)
	UpdateProject(req models.UpdateProjectRequest) (*models.Project, error)
	DeleteProject(id uuid.UUID) (string, error)
	ListProjects(limit, offset int32) ([]*models.Project, error)
}

type Client struct {
	cfg *config.Config
	api content.ContentServiceClient
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

	addr := fmt.Sprintf("%s:%d", cfg.ContentService.Host, cfg.ContentService.Port)
	conn, err := grpc.DialContext(ctx, addr, opts...)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to %s: %w", addr, err)
	}

	return &Client{
		api: content.NewContentServiceClient(conn),
		log: log,
		ctx: ctx,
	}, nil
}

func (c *Client) CreateNews(req models.CreateNewsRequest) (*models.CreateNewsResponse, error) {
	data, err := c.api.CreateNews(c.ctx, &content.CreateNewsRequest{
		Title:      req.Title,
		Content:    req.Content,
		UploadedBy: req.UploadedBy.String(),
		Filename:   req.Filename,
		File:       req.File,
	})
	if err != nil {
		return nil, err
	}

	id, _ := uuid.Parse(data.Id)
	uploadedBy, _ := uuid.Parse(data.UploadedBy)

	return &models.CreateNewsResponse{
		ID:         id,
		Title:      data.Title,
		Content:    data.Content,
		UploadedBy: uploadedBy,
		CreatedAt:  data.CreatedAt,
		FileURL:    data.FileUrl,
	}, nil
}

func (c *Client) GetNews(req models.GetNewsRequest) (*models.GetNewsResponse, error) {
	data, err := c.api.GetNews(c.ctx, &content.GetNewsRequest{
		Id: req.ID.String(),
	})
	if err != nil {
		return nil, err
	}

	id, _ := uuid.Parse(data.Id)
	uploadedBy, _ := uuid.Parse(data.UploadedBy)

	b := []byte(data.File)
	base64Str := base64.StdEncoding.EncodeToString(b)
	return &models.GetNewsResponse{
		ID:         id,
		Title:      data.Title,
		Content:    data.Content,
		UploadedBy: uploadedBy,
		CreatedAt:  data.CreatedAt,
		UpdatedAt:  data.UpdatedAt,
		File:       base64Str,
		Filename:   data.Filename,
	}, nil
}

func (c *Client) UpdateNews(req models.UpdateNewsRequest) (*models.UpdateNewsResponse, error) {
	data, err := c.api.UpdateNews(c.ctx, &content.UpdateNewsRequest{
		Id:         req.ID.String(),
		Title:      req.Title,
		Content:    req.Content,
		UploadedBy: req.UploadedBy.String(),
	})
	if err != nil {
		return nil, err
	}

	id, _ := uuid.Parse(data.Id)
	uploadedBy, _ := uuid.Parse(data.UploadedBy)

	return &models.UpdateNewsResponse{
		ID:         id,
		Title:      data.Title,
		Content:    data.Content,
		UploadedBy: uploadedBy,
		CreatedAt:  data.CreatedAt,
		UpdatedAt:  data.UpdatedAt,
	}, nil
}

func (c *Client) DeleteNews(req models.DeleteNewsRequest) (*models.DeleteNewsResponse, error) {
	data, err := c.api.DeleteNews(c.ctx, &content.DeleteNewsRequest{
		Id: req.ID.String(),
	})
	if err != nil {
		return nil, err
	}

	id, _ := uuid.Parse(data.Id)

	return &models.DeleteNewsResponse{
		ID:      id,
		Message: data.Message,
	}, nil
}

func (c *Client) ListNews(req models.ListNewsRequest) (*models.ListNewsResponse, error) {
	data, err := c.api.ListNews(c.ctx, &content.ListNewsRequest{
		Limit:  req.Limit,
		Offset: req.Offset,
	})
	if err != nil {
		return nil, err
	}

	var items []models.GetNewsResponse
	for _, n := range data.Items {
		id, _ := uuid.Parse(n.Id)
		uploadedBy, _ := uuid.Parse(n.UploadedBy)
		b := []byte(n.File)
		base64Str := base64.StdEncoding.EncodeToString(b)
		items = append(items, models.GetNewsResponse{
			ID:         id,
			Title:      n.Title,
			Content:    n.Content,
			UploadedBy: uploadedBy,
			CreatedAt:  n.CreatedAt,
			UpdatedAt:  n.UpdatedAt,
			File:       base64Str,
			Filename:   n.Filename,
		})
	}
	return &models.ListNewsResponse{
		Items: items,
	}, nil
}

func (c *Client) GetCountNews() (*models.GetCountNewsResponse, error) {
	data, err := c.api.GetCountNews(c.ctx, &content.Empty{})
	if err != nil {
		return nil, err
	}

	return &models.GetCountNewsResponse{
		Count: data.Count,
	}, nil
}

func (c *Client) CreateVacancy(req models.CreateVacancyRequest) (*models.CreateVacancyResponse, error) {
	data, err := c.api.CreateVacancy(c.ctx, &content.CreateVacancyRequest{
		Position:    req.Position,
		Description: req.Description,
		Salary:      req.Salary,
		IsActive:    req.IsActive,
	})
	if err != nil {
		return nil, err
	}

	id, _ := uuid.Parse(data.Id)
	return &models.CreateVacancyResponse{
		ID:          id,
		Position:    data.Position,
		Description: data.Description,
		Salary:      data.Salary,
		IsActive:    data.IsActive,
		PublishedAt: data.PublishedAt,
	}, nil
}

func (c *Client) GetVacancy(req models.GetVacancyRequest) (*models.GetVacancyResponse, error) {
	data, err := c.api.GetVacancy(c.ctx, &content.GetVacancyRequest{
		Id: req.ID.String(),
	})
	if err != nil {
		return nil, err
	}

	id, _ := uuid.Parse(data.Id)
	return &models.GetVacancyResponse{
		ID:          id,
		Position:    data.Position,
		Description: data.Description,
		Salary:      data.Salary,
		IsActive:    data.IsActive,
		PublishedAt: data.PublishedAt,
	}, nil
}

func (c *Client) UpdateVacancy(req models.UpdateVacancyRequest) (*models.UpdateVacancyResponse, error) {
	data, err := c.api.UpdateVacancy(c.ctx, &content.UpdateVacancyRequest{
		Id:          req.ID.String(),
		Position:    req.Position,
		Description: req.Description,
		Salary:      req.Salary,
		IsActive:    req.IsActive,
	})
	if err != nil {
		return nil, err
	}

	id, _ := uuid.Parse(data.Id)
	return &models.UpdateVacancyResponse{
		ID:          id,
		Position:    data.Position,
		Description: data.Description,
		Salary:      data.Salary,
		IsActive:    data.IsActive,
		PublishedAt: data.PublishedAt,
	}, nil
}

func (c *Client) DeleteVacancy(req models.DeleteVacancyRequest) (*models.DeleteVacancyResponse, error) {
	data, err := c.api.DeleteVacancy(c.ctx, &content.DeleteVacancyRequest{
		Id: req.ID.String(),
	})
	if err != nil {
		return nil, err
	}

	id, _ := uuid.Parse(data.Id)
	return &models.DeleteVacancyResponse{
		ID:      id,
		Message: data.Message,
	}, nil
}

func (c *Client) ListAllVacancies(req models.ListVacanciesRequest) (*models.ListVacanciesResponse, error) {
	data, err := c.api.ListAllVacancies(c.ctx, &content.ListVacanciesRequest{
		Limit:  req.Limit,
		Offset: req.Offset,
	})
	if err != nil {
		return nil, err
	}

	var items []models.GetVacancyResponse
	for _, v := range data.Items {
		id, _ := uuid.Parse(v.Id)
		items = append(items, models.GetVacancyResponse{
			ID:          id,
			Position:    v.Position,
			Description: v.Description,
			Salary:      v.Salary,
			IsActive:    v.IsActive,
			PublishedAt: v.PublishedAt,
		})
	}

	return &models.ListVacanciesResponse{Items: items}, nil
}

func (c *Client) ListActiveVacancies(req models.ListVacanciesRequest) (*models.ListVacanciesResponse, error) {
	data, err := c.api.ListActiveVacancies(c.ctx, &content.ListVacanciesRequest{
		Limit:  req.Limit,
		Offset: req.Offset,
	})
	if err != nil {
		return nil, err
	}

	var items []models.GetVacancyResponse
	for _, v := range data.Items {
		id, _ := uuid.Parse(v.Id)
		items = append(items, models.GetVacancyResponse{
			ID:          id,
			Position:    v.Position,
			Description: v.Description,
			Salary:      v.Salary,
			IsActive:    v.IsActive,
			PublishedAt: v.PublishedAt,
		})
	}

	return &models.ListVacanciesResponse{Items: items}, nil
}

func (c *Client) GetCountVacancies() (*models.GetCountVacanciesResponse, error) {
	data, err := c.api.GetCountVacancies(c.ctx, &content.Empty{})
	if err != nil {
		return nil, err
	}

	return &models.GetCountVacanciesResponse{
		Count: data.Count,
	}, nil
}

func (c *Client) CreateDocument(req models.CreateDocumentRequest) (*models.CreateDocumentResponse, error) {
	data, err := c.api.CreateDocument(c.ctx, &content.CreateDocumentRequest{
		Title:       req.Title,
		Description: req.Description,
		UploadedBy:  req.UploadedBy.String(),
		File:        req.File,
		Filename:    req.Filename,
	})
	if err != nil {
		return nil, err
	}

	id, _ := uuid.Parse(data.Id)
	uploadedBy, _ := uuid.Parse(data.UploadedBy)

	return &models.CreateDocumentResponse{
		ID:          id,
		Title:       data.Title,
		Description: data.Description,
		UploadedBy:  uploadedBy,
		CreatedAt:   data.CreatedAt,
		Filename:    data.Filename,
		FileURL:     data.FileUrl,
	}, nil
}

func (c *Client) GetDocument(req models.GetDocumentRequest) (*models.GetDocumentResponse, error) {
	data, err := c.api.GetDocument(c.ctx, &content.GetDocumentRequest{
		Id: req.ID.String(),
	})
	if err != nil {
		return nil, err
	}

	doc := data.Document
	id, _ := uuid.Parse(doc.Id)
	uploadedBy, _ := uuid.Parse(doc.UploadedBy)

	return &models.GetDocumentResponse{
		Document: models.Document{
			ID:          id,
			Title:       doc.Title,
			Description: doc.Description,
			UploadedBy:  uploadedBy,
			CreatedAt:   doc.CreatedAt,
			File:        doc.File,
			Filename:    doc.Filename,
		},
	}, nil
}

func (c *Client) ListDocuments(req models.ListDocumentsRequest) (*models.ListDocumentsResponse, error) {
	data, err := c.api.ListDocuments(c.ctx, &content.ListDocumentsRequest{
		Limit:  req.Limit,
		Offset: req.Offset,
	})
	if err != nil {
		return nil, err
	}

	var items []models.Document
	for _, d := range data.Items {
		id, _ := uuid.Parse(d.Id)
		uploadedBy, _ := uuid.Parse(d.UploadedBy)

		b := []byte(d.File)
		base64Str := base64.StdEncoding.EncodeToString(b)
		items = append(items, models.Document{
			ID:          id,
			Title:       d.Title,
			Description: d.Description,
			UploadedBy:  uploadedBy,
			CreatedAt:   d.CreatedAt,
			File:        []byte(base64Str),
			Filename:    d.Filename,
		})
	}

	return &models.ListDocumentsResponse{
		Items: items,
	}, nil
}

func (c *Client) DeleteDocument(req models.DeleteDocumentRequest) error {
	_, err := c.api.DeleteDocument(c.ctx, &content.DeleteDocumentRequest{
		Id: req.ID.String(),
	})
	return err
}

func (c *Client) CreateContact(req models.ContactCreate) (*models.Contact, error) {
	data, err := c.api.CreateContact(c.ctx, &content.ContactRequest{
		Title:     req.Title,
		Phones:    req.Phones,
		Emails:    req.Emails,
		Addresses: req.Addresses,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create contact: %w", err)
	}

	return &models.Contact{
		ID:        uuid.MustParse(data.Id),
		Title:     data.Title,
		Phones:    data.Phones,
		Emails:    data.Emails,
		Addresses: data.Addresses,
	}, nil
}

func (c *Client) GetContact(id uuid.UUID) (*models.Contact, error) {
	data, err := c.api.GetContact(c.ctx, &content.ContactId{Id: id.String()})
	if err != nil {
		return nil, fmt.Errorf("failed to get contact: %w", err)
	}

	return &models.Contact{
		ID:        uuid.MustParse(data.Id),
		Title:     data.Title,
		Phones:    data.Phones,
		Emails:    data.Emails,
		Addresses: data.Addresses,
	}, nil
}

func (c *Client) ListContacts(limit, offset int32) ([]*models.Contact, error) {
	data, err := c.api.ListContacts(c.ctx, &content.ContactListRequest{
		Limit:  limit,
		Offset: offset,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to list contacts: %w", err)
	}

	var contacts []*models.Contact
	for _, item := range data.Items {
		contacts = append(contacts, &models.Contact{
			ID:        uuid.MustParse(item.Id),
			Title:     item.Title,
			Phones:    item.Phones,
			Emails:    item.Emails,
			Addresses: item.Addresses,
		})
	}

	return contacts, nil
}

func (c *Client) UpdateContact(req models.Contact) (*models.Contact, error) {
	data, err := c.api.UpdateContact(c.ctx, &content.Contact{
		Id:        req.ID.String(),
		Title:     req.Title,
		Phones:    req.Phones,
		Emails:    req.Emails,
		Addresses: req.Addresses,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to update contact: %w", err)
	}

	return &models.Contact{
		ID:        uuid.MustParse(data.Id),
		Title:     data.Title,
		Phones:    data.Phones,
		Emails:    data.Emails,
		Addresses: data.Addresses,
	}, nil
}

func (c *Client) DeleteContact(id uuid.UUID) (string, error) {
	data, err := c.api.DeleteContact(c.ctx, &content.ContactId{Id: id.String()})
	if err != nil {
		return "", fmt.Errorf("failed to delete contact: %w", err)
	}
	return data.Message, nil
}

func (c *Client) CreateProject(req models.CreateProjectRequest) (*models.Project, error) {
	data, err := c.api.CreateProject(c.ctx, &content.CreateProjectRequest{
		Title:       req.Title,
		Description: req.Description,
		UploadedBy:  req.UploadedBy.String(),
		Filename:    req.Filename,
		File:        req.File,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create project: %w", err)
	}

	return &models.Project{
		ID:          uuid.MustParse(data.Id),
		Title:       data.Title,
		Description: data.Description,
		UploadedBy:  uuid.MustParse(data.UploadedBy),
		CreatedAt:   data.CreatedAt,
		FileURL:     data.FileUrl,
	}, nil
}

func (c *Client) GetProject(id uuid.UUID) (*models.Project, error) {
	data, err := c.api.GetProject(c.ctx, &content.GetProjectRequest{Id: id.String()})
	if err != nil {
		return nil, fmt.Errorf("failed to get project: %w", err)
	}

	return &models.Project{
		ID:          uuid.MustParse(data.Id),
		Title:       data.Title,
		Description: data.Description,
		UploadedBy:  uuid.MustParse(data.UploadedBy),
		CreatedAt:   data.CreatedAt,
		UpdatedAt:   data.UpdatedAt,
		Filename:    data.Filename,
		File:        data.File,
	}, nil
}

func (c *Client) UpdateProject(req models.UpdateProjectRequest) (*models.Project, error) {
	data, err := c.api.UpdateProject(c.ctx, &content.UpdateProjectRequest{
		Id:          req.ID.String(),
		Title:       req.Title,
		Description: req.Description,
		UploadedBy:  req.UploadedBy.String(),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to update project: %w", err)
	}

	return &models.Project{
		ID:          uuid.MustParse(data.Id),
		Title:       data.Title,
		Description: data.Description,
		UploadedBy:  uuid.MustParse(data.UploadedBy),
		CreatedAt:   data.CreatedAt,
		UpdatedAt:   data.UpdatedAt,
	}, nil
}

func (c *Client) DeleteProject(id uuid.UUID) (string, error) {
	data, err := c.api.DeleteProject(c.ctx, &content.DeleteProjectRequest{Id: id.String()})
	if err != nil {
		return "", fmt.Errorf("failed to delete project: %w", err)
	}
	return data.Message, nil
}

func (c *Client) ListProjects(limit, offset int32) ([]*models.Project, error) {
	resp, err := c.api.ListProjects(c.ctx, &content.ListProjectsRequest{
		Limit:  limit,
		Offset: offset,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to list projects: %w", err)
	}

	var projects []*models.Project
	for _, item := range resp.Items {
		projects = append(projects, &models.Project{
			ID:          uuid.MustParse(item.Id),
			Title:       item.Title,
			Description: item.Description,
			UploadedBy:  uuid.MustParse(item.UploadedBy),
			CreatedAt:   item.CreatedAt,
			UpdatedAt:   item.UpdatedAt,
			Filename:    item.Filename,
			File:        item.File,
		})
	}
	return projects, nil
}
