package http

import (
	"encoding/base64"
	"net/http"
	"strconv"

	"github.com/google/uuid"
	"github.com/hackathonsrus/Smolathon_defer_panic_159/tree/main/api-gateway/internal/controller/models"
	"github.com/labstack/echo"
	"go.uber.org/zap"
)

// Create News (editor or admin)
func (ctrl *Controller) handleCreateNews(ctx echo.Context) error {
	var req models.CreateNewsRequestHTTP
	if err := ctx.Bind(&req); err != nil {
		ctrl.log.Error("failed to bind create news request", zap.Error(err))
		return ctx.JSON(http.StatusBadRequest, err.Error())
	}

	id, role, err := ctrl.getUserDataFromToken(ctx)
	if err != nil {
		ctrl.log.Error("failed to get token from header", zap.Error(err))
		return ctx.JSON(http.StatusForbidden, "unforbidden")
	}

	if role != editorRole && role != adminRole {
		ctrl.log.Error("failed to get token from header", zap.Error(err))
		return ctx.JSON(http.StatusForbidden, "unforbidden")
	}

	arr, err := base64.StdEncoding.DecodeString(req.File)
	if err != nil {
		ctrl.log.Error("failed to conver photo str to byte", zap.Error(err))
		return ctx.JSON(http.StatusBadRequest, "error")
	}
	dto := models.CreateNewsRequest{
		Title:      req.Title,
		Content:    req.Content,
		UploadedBy: id,
		Filename:   req.Filename,
		File:       arr,
	}

	data, err := ctrl.contentClient.CreateNews(dto)
	if err != nil {
		ctrl.log.Error("failed to create news", zap.Error(err))
		return ctx.JSON(http.StatusInternalServerError, err.Error())
	}

	ctrl.log.Info("news created successfully", zap.Any("news", data))
	return ctx.JSON(http.StatusCreated, data)
}

// Get News for all people
func (ctrl *Controller) handleGetNews(ctx echo.Context) error {
	id := ctx.Param("id")
	reqID, err := uuid.Parse(id)
	if err != nil {
		ctrl.log.Error("invalid news ID", zap.Error(err))
		return ctx.JSON(http.StatusBadRequest, err.Error())
	}

	data, err := ctrl.contentClient.GetNews(models.GetNewsRequest{ID: reqID})
	if err != nil {
		ctrl.log.Error("failed to get news", zap.Error(err))
		return ctx.JSON(http.StatusInternalServerError, err.Error())
	}

	ctrl.log.Info("news retrieved successfully", zap.String("news_id", reqID.String()))
	return ctx.JSON(http.StatusOK, data)
}

// Update News (editor or admin)
func (ctrl *Controller) handleUpdateNews(ctx echo.Context) error {
	news_id := ctx.Param("id")
	reqID, err := uuid.Parse(news_id)
	if err != nil {
		ctrl.log.Error("invalid news ID", zap.Error(err))
		return ctx.JSON(http.StatusBadRequest, err.Error())
	}

	var req models.UpdateNewsRequestHTTP
	if err := ctx.Bind(&req); err != nil {
		ctrl.log.Error("failed to bind update news request", zap.Error(err))
		return ctx.JSON(http.StatusBadRequest, err.Error())
	}

	id, role, err := ctrl.getUserDataFromToken(ctx)
	if err != nil {
		ctrl.log.Error("failed to get token from header", zap.Error(err))
		return ctx.JSON(http.StatusForbidden, "unforbidden")
	}

	if role != editorRole && role != adminRole {
		ctrl.log.Error("failed to get token from header", zap.Error(err))
		return ctx.JSON(http.StatusForbidden, "unforbidden")
	}

	dto := models.UpdateNewsRequest{
		ID:         reqID,
		Title:      req.Title,
		Content:    req.Content,
		UploadedBy: id,
	}

	data, err := ctrl.contentClient.UpdateNews(dto)
	if err != nil {
		ctrl.log.Error("failed to update news", zap.Error(err))
		return ctx.JSON(http.StatusInternalServerError, err.Error())
	}

	ctrl.log.Info("news updated successfully", zap.Any("news", data))
	return ctx.JSON(http.StatusOK, data)
}

// Delete News (editor or admins)
func (ctrl *Controller) handleDeleteNews(ctx echo.Context) error {
	news_id := ctx.Param("id")
	reqID, err := uuid.Parse(news_id)
	if err != nil {
		ctrl.log.Error("invalid news ID", zap.Error(err))
		return ctx.JSON(http.StatusBadRequest, err.Error())
	}

	_, role, err := ctrl.getUserDataFromToken(ctx)
	if err != nil {
		ctrl.log.Error("failed to get token from header", zap.Error(err))
		return ctx.JSON(http.StatusForbidden, "unforbidden")
	}

	if role != editorRole && role != adminRole {
		ctrl.log.Error("failed to get token from header", zap.Error(err))
		return ctx.JSON(http.StatusForbidden, "unforbidden")
	}

	data, err := ctrl.contentClient.DeleteNews(models.DeleteNewsRequest{ID: reqID})
	if err != nil {
		ctrl.log.Error("failed to delete news", zap.Error(err))
		return ctx.JSON(http.StatusInternalServerError, err.Error())
	}

	ctrl.log.Info("news deleted successfully", zap.String("news_id", reqID.String()))
	return ctx.JSON(http.StatusOK, data)
}

// ListNews (for all users)
func (ctrl *Controller) handleListNews(ctx echo.Context) error {
	limit, _ := strconv.Atoi(ctx.QueryParam("limit"))
	offset, _ := strconv.Atoi(ctx.QueryParam("offset"))

	data, err := ctrl.contentClient.ListNews(models.ListNewsRequest{
		Limit:  int32(limit),
		Offset: int32(offset),
	})
	if err != nil {
		ctrl.log.Error("failed to list news", zap.Error(err))
		return ctx.JSON(http.StatusInternalServerError, err.Error())
	}

	ctrl.log.Info("news list retrieved successfully", zap.Int("limit", limit), zap.Int("offset", offset))
	return ctx.JSON(http.StatusOK, data)
}

// Get Count News (for all users)
func (ctrl *Controller) handleGetCountNews(ctx echo.Context) error {
	data, err := ctrl.contentClient.GetCountNews()
	if err != nil {
		ctrl.log.Error("failed to get news count", zap.Error(err))
		return ctx.JSON(http.StatusInternalServerError, err.Error())
	}

	ctrl.log.Info("news count retrieved successfully", zap.Any("count", data))
	return ctx.JSON(http.StatusOK, data)
}

// Create Vacancy (only for admin)
func (ctrl *Controller) handleCreateVacancy(ctx echo.Context) error {
	var req models.CreateVacancyRequest
	if err := ctx.Bind(&req); err != nil {
		ctrl.log.Error("failed to bind create vacancy request", zap.Error(err))
		return ctx.JSON(http.StatusBadRequest, err.Error())
	}

	_, role, err := ctrl.getUserDataFromToken(ctx)
	if err != nil {
		ctrl.log.Error("failed to get token from header", zap.Error(err))
		return ctx.JSON(http.StatusForbidden, "unforbidden")
	}

	if role != adminRole {
		ctrl.log.Error("failed to get token from header", zap.Error(err))
		return ctx.JSON(http.StatusForbidden, "unforbidden")
	}

	data, err := ctrl.contentClient.CreateVacancy(req)
	if err != nil {
		ctrl.log.Error("failed to create vacancy", zap.Error(err))
		return ctx.JSON(http.StatusInternalServerError, err.Error())
	}

	ctrl.log.Info("vacancy created successfully", zap.Any("vacancy", data))
	return ctx.JSON(http.StatusCreated, data)
}

// Get Vacancy (for all users)
func (ctrl *Controller) handleGetVacancy(ctx echo.Context) error {
	id := ctx.Param("id")
	req := models.GetVacancyRequest{ID: uuid.MustParse(id)}

	data, err := ctrl.contentClient.GetVacancy(req)
	if err != nil {
		ctrl.log.Error("failed to get vacancy", zap.Error(err))
		return ctx.JSON(http.StatusInternalServerError, err.Error())
	}

	ctrl.log.Info("vacancy retrieved successfully", zap.String("vacancy_id", id))
	return ctx.JSON(http.StatusOK, data)
}

// Update Vacancy (only for admin)
func (ctrl *Controller) handleUpdateVacancy(ctx echo.Context) error {
	vacancy_id := ctx.Param("id")
	reqID, err := uuid.Parse(vacancy_id)
	if err != nil {
		ctrl.log.Error("invalid news ID", zap.Error(err))
		return ctx.JSON(http.StatusBadRequest, err.Error())
	}

	var req models.UpdateVacancyRequestHTTP
	if err := ctx.Bind(&req); err != nil {
		ctrl.log.Error("failed to bind update vacancy request", zap.Error(err))
		return ctx.JSON(http.StatusBadRequest, err.Error())
	}

	_, role, err := ctrl.getUserDataFromToken(ctx)
	if err != nil {
		ctrl.log.Error("failed to get token from header", zap.Error(err))
		return ctx.JSON(http.StatusForbidden, "unforbidden")
	}

	if role != adminRole {
		ctrl.log.Error("failed to get token from header", zap.Error(err))
		return ctx.JSON(http.StatusForbidden, "unforbidden")
	}

	dto := models.UpdateVacancyRequest{
		ID:          reqID,
		Position:    req.Position,
		Description: req.Description,
		Salary:      req.Salary,
		IsActive:    req.IsActive,
	}

	data, err := ctrl.contentClient.UpdateVacancy(dto)
	if err != nil {
		ctrl.log.Error("failed to update vacancy", zap.Error(err))
		return ctx.JSON(http.StatusInternalServerError, err.Error())
	}

	ctrl.log.Info("vacancy updated successfully", zap.Any("vacancy", data))
	return ctx.JSON(http.StatusOK, data)
}

// Delete Vacancy(only for admin)
func (ctrl *Controller) handleDeleteVacancy(ctx echo.Context) error {
	id := ctx.Param("id")
	req := models.DeleteVacancyRequest{ID: uuid.MustParse(id)}
	_, role, err := ctrl.getUserDataFromToken(ctx)
	if err != nil {
		ctrl.log.Error("failed to get token from header", zap.Error(err))
		return ctx.JSON(http.StatusForbidden, "unforbidden")
	}

	if role != adminRole {
		ctrl.log.Error("failed to get token from header", zap.Error(err))
		return ctx.JSON(http.StatusForbidden, "unforbidden")
	}

	data, err := ctrl.contentClient.DeleteVacancy(req)
	if err != nil {
		ctrl.log.Error("failed to delete vacancy", zap.Error(err))
		return ctx.JSON(http.StatusInternalServerError, err.Error())
	}

	ctrl.log.Info("vacancy deleted successfully", zap.String("vacancy_id", id))
	return ctx.JSON(http.StatusOK, data)
}

// List All Vacancies(for all people)
func (ctrl *Controller) handleListAllVacancies(ctx echo.Context) error {
	limit, _ := strconv.Atoi(ctx.QueryParam("limit"))
	offset, _ := strconv.Atoi(ctx.QueryParam("offset"))

	req := models.ListVacanciesRequest{
		Limit:  int32(limit),
		Offset: int32(offset),
	}

	data, err := ctrl.contentClient.ListAllVacancies(req)
	if err != nil {
		ctrl.log.Error("failed to list all vacancies", zap.Error(err))
		return ctx.JSON(http.StatusInternalServerError, err.Error())
	}

	ctrl.log.Info("all vacancies listed successfully", zap.Int("limit", limit), zap.Int("offset", offset))
	return ctx.JSON(http.StatusOK, data)
}

// List Active Vacancies(for all people)
func (ctrl *Controller) handleListActiveVacancies(ctx echo.Context) error {
	limit, _ := strconv.Atoi(ctx.QueryParam("limit"))
	offset, _ := strconv.Atoi(ctx.QueryParam("offset"))

	req := models.ListVacanciesRequest{
		Limit:  int32(limit),
		Offset: int32(offset),
	}

	data, err := ctrl.contentClient.ListActiveVacancies(req)
	if err != nil {
		ctrl.log.Error("failed to list active vacancies", zap.Error(err))
		return ctx.JSON(http.StatusInternalServerError, err.Error())
	}

	ctrl.log.Info("active vacancies listed successfully", zap.Int("limit", limit), zap.Int("offset", offset))
	return ctx.JSON(http.StatusOK, data)
}

// Get Count Vacancies(for all users)
func (ctrl *Controller) handleGetCountVacancies(ctx echo.Context) error {
	data, err := ctrl.contentClient.GetCountVacancies()
	if err != nil {
		ctrl.log.Error("failed to get vacancies count", zap.Error(err))
		return ctx.JSON(http.StatusInternalServerError, err.Error())
	}

	ctrl.log.Info("vacancies count retrieved successfully", zap.Any("count", data))
	return ctx.JSON(http.StatusOK, data)
}

// Create Document (only for admin and editors)
func (ctrl *Controller) handleCreateDocument(ctx echo.Context) error {
	var req models.CreateDocumentRequestHTTP
	if err := ctx.Bind(&req); err != nil {
		ctrl.log.Error("failed to bind create document request", zap.Error(err))
		return ctx.JSON(http.StatusBadRequest, err.Error())
	}
	id, role, err := ctrl.getUserDataFromToken(ctx)
	if err != nil {
		ctrl.log.Error("failed to get token from header", zap.Error(err))
		return ctx.JSON(http.StatusForbidden, "unforbidden")
	}

	if role != editorRole && role != adminRole {
		ctrl.log.Error("failed to get token from header", zap.Error(err))
		return ctx.JSON(http.StatusForbidden, "unforbidden")
	}

	arr, err := base64.StdEncoding.DecodeString(req.File)
	if err != nil {
		ctrl.log.Error("failed to conver photo str to byte", zap.Error(err))
		return ctx.JSON(http.StatusBadRequest, "error")
	}

	dto := models.CreateDocumentRequest{
		Title:       req.Title,
		Description: req.Title,
		UploadedBy:  id,
		File:        arr,
		Filename:    req.Filename,
	}

	data, err := ctrl.contentClient.CreateDocument(dto)
	if err != nil {
		ctrl.log.Error("failed to create document", zap.Error(err))
		return ctx.JSON(http.StatusInternalServerError, err.Error())
	}

	ctrl.log.Info("document created successfully", zap.Any("document", data))
	return ctx.JSON(http.StatusCreated, data)
}

// Get Documnet(for all user)
func (ctrl *Controller) handleGetDocument(ctx echo.Context) error {
	id := ctx.Param("id")
	req := models.GetDocumentRequest{ID: uuid.MustParse(id)}

	data, err := ctrl.contentClient.GetDocument(req)
	if err != nil {
		ctrl.log.Error("failed to get document", zap.Error(err))
		return ctx.JSON(http.StatusInternalServerError, err.Error())
	}

	ctrl.log.Info("document retrieved successfully", zap.String("document_id", id))
	return ctx.JSON(http.StatusOK, data)
}

// Get Documnet(for all user) can use limit and offset
func (ctrl *Controller) handleListDocuments(ctx echo.Context) error {
	limit, _ := strconv.Atoi(ctx.QueryParam("limit"))
	offset, _ := strconv.Atoi(ctx.QueryParam("offset"))

	req := models.ListDocumentsRequest{
		Limit:  int32(limit),
		Offset: int32(offset),
	}

	data, err := ctrl.contentClient.ListDocuments(req)
	if err != nil {
		ctrl.log.Error("failed to list documents", zap.Error(err))
		return ctx.JSON(http.StatusInternalServerError, err.Error())
	}

	ctrl.log.Info("documents listed successfully", zap.Int("limit", limit), zap.Int("offset", offset))
	return ctx.JSON(http.StatusOK, data)
}

// Delete Document(only for admin and editor)
func (ctrl *Controller) handleDeleteDocument(ctx echo.Context) error {
	id := ctx.Param("id")
	req := models.DeleteDocumentRequest{ID: uuid.MustParse(id)}
	_, role, err := ctrl.getUserDataFromToken(ctx)
	if err != nil {
		ctrl.log.Error("failed to get token from header", zap.Error(err))
		return ctx.JSON(http.StatusForbidden, "unforbidden")
	}

	if role != editorRole && role != adminRole {
		ctrl.log.Error("failed to get token from header", zap.Error(err))
		return ctx.JSON(http.StatusForbidden, "unforbidden")
	}

	err = ctrl.contentClient.DeleteDocument(req)
	if err != nil {
		ctrl.log.Error("failed to delete document", zap.Error(err))
		return ctx.JSON(http.StatusInternalServerError, err.Error())
	}

	ctrl.log.Info("document deleted successfully", zap.String("document_id", id))
	return ctx.JSON(http.StatusOK, map[string]string{"message": "document deleted"})
}

// Create Contact(only for admin and editor)
func (ctrl *Controller) handleCreateContact(ctx echo.Context) error {
	var req models.ContactCreate
	if err := ctx.Bind(&req); err != nil {
		ctrl.log.Error("invalid request", zap.Error(err))
		return ctx.JSON(http.StatusBadRequest, "invalid request body")
	}

	_, role, err := ctrl.getUserDataFromToken(ctx)
	if err != nil {
		ctrl.log.Error("failed to get token from header", zap.Error(err))
		return ctx.JSON(http.StatusForbidden, "unforbidden")
	}

	if role != editorRole && role != adminRole {
		ctrl.log.Error("failed to get token from header", zap.Error(err))
		return ctx.JSON(http.StatusForbidden, "unforbidden")
	}

	contact, err := ctrl.contentClient.CreateContact(req)
	if err != nil {
		ctrl.log.Error("failed to create contact", zap.Error(err))
		return ctx.JSON(http.StatusInternalServerError, err.Error())
	}

	ctrl.log.Info("contact created", zap.String("id", contact.ID.String()))
	return ctx.JSON(http.StatusCreated, contact)
}

// Get Contcact(for all users)
func (ctrl *Controller) handleGetContact(ctx echo.Context) error {
	id := ctx.Param("id")
	reqID := uuid.MustParse(id)

	contact, err := ctrl.contentClient.GetContact(reqID)
	if err != nil {
		ctrl.log.Error("failed to get contact", zap.String("id", id), zap.Error(err))
		return ctx.JSON(http.StatusInternalServerError, err.Error())
	}

	return ctx.JSON(http.StatusOK, contact)
}

// List Contacts(for all users)
func (ctrl *Controller) handleListContacts(ctx echo.Context) error {
	limit, _ := strconv.Atoi(ctx.QueryParam("limit"))
	offset, _ := strconv.Atoi(ctx.QueryParam("offset"))

	contacts, err := ctrl.contentClient.ListContacts(int32(limit), int32(offset))
	if err != nil {
		ctrl.log.Error("failed to list contacts", zap.Error(err))
		return ctx.JSON(http.StatusInternalServerError, err.Error())
	}

	ctrl.log.Info("contacts listed", zap.Int("limit", limit), zap.Int("offset", offset))
	return ctx.JSON(http.StatusOK, contacts)
}

// Update Contact(only for admit and editor)
func (ctrl *Controller) handleUpdateContact(ctx echo.Context) error {
	id := ctx.Param("id")
	reqID := uuid.MustParse(id)
	_, role, err := ctrl.getUserDataFromToken(ctx)
	if err != nil {
		ctrl.log.Error("failed to get token from header", zap.Error(err))
		return ctx.JSON(http.StatusForbidden, "unforbidden")
	}

	if role != editorRole && role != adminRole {
		ctrl.log.Error("failed to get token from header", zap.Error(err))
		return ctx.JSON(http.StatusForbidden, "unforbidden")
	}

	var req models.ContactCreate
	if err := ctx.Bind(&req); err != nil {
		ctrl.log.Error("invalid request", zap.Error(err))
		return ctx.JSON(http.StatusBadRequest, "invalid request body")
	}

	dto := models.Contact{
		ID:        reqID,
		Title:     req.Title,
		Phones:    req.Phones,
		Emails:    req.Emails,
		Addresses: req.Addresses,
	}

	updated, err := ctrl.contentClient.UpdateContact(dto)
	if err != nil {
		ctrl.log.Error("failed to update contact", zap.String("id", id), zap.Error(err))
		return ctx.JSON(http.StatusInternalServerError, err.Error())
	}

	return ctx.JSON(http.StatusOK, updated)
}

// DELETE (only for admin and editors)
func (ctrl *Controller) handleDeleteContact(ctx echo.Context) error {
	id := ctx.Param("id")
	reqID := uuid.MustParse(id)
	_, role, err := ctrl.getUserDataFromToken(ctx)
	if err != nil {
		ctrl.log.Error("failed to get token from header", zap.Error(err))
		return ctx.JSON(http.StatusForbidden, "unforbidden")
	}

	if role != editorRole && role != adminRole {
		ctrl.log.Error("failed to get token from header", zap.Error(err))
		return ctx.JSON(http.StatusForbidden, "unforbidden")
	}

	message, err := ctrl.contentClient.DeleteContact(reqID)
	if err != nil {
		ctrl.log.Error("failed to delete contact", zap.String("id", id), zap.Error(err))
		return ctx.JSON(http.StatusInternalServerError, err.Error())
	}

	return ctx.JSON(http.StatusOK, map[string]string{"message": message})
}

// Create Project(only for admin and editor)
func (ctrl *Controller) handleCreateProject(ctx echo.Context) error {
	var req models.CreateProjectRequestHTTP
	if err := ctx.Bind(&req); err != nil {
		ctrl.log.Error("failed to bind create project request", zap.Error(err))
		return ctx.JSON(http.StatusBadRequest, err.Error())
	}
	id, role, err := ctrl.getUserDataFromToken(ctx)
	if err != nil {
		ctrl.log.Error("failed to get token from header", zap.Error(err))
		return ctx.JSON(http.StatusForbidden, "unforbidden")
	}

	if role != editorRole && role != adminRole {
		ctrl.log.Error("failed to get token from header", zap.Error(err))
		return ctx.JSON(http.StatusForbidden, "unforbidden")
	}

	baseStr64, err := base64.StdEncoding.DecodeString(req.File)
	if err != nil {
		ctrl.log.Error("failed to conver photo str to byte", zap.Error(err))
		return ctx.JSON(http.StatusBadRequest, "error")
	}

	dto := models.CreateProjectRequest{
		Title:       req.Title,
		Description: req.Description,
		UploadedBy:  id,
		Filename:    req.Filename,
		File:        baseStr64,
	}
	project, err := ctrl.contentClient.CreateProject(dto)
	if err != nil {
		ctrl.log.Error("failed to create project", zap.Error(err))
		return ctx.JSON(http.StatusInternalServerError, err.Error())
	}

	res := models.ProjectResponse{
		ID:          project.ID,
		Title:       project.Title,
		Description: project.Description,
		UploadedBy:  id,
		CreatedAt:   project.CreatedAt,
		UpdatedAt:   project.UpdatedAt,
		Filename:    project.Filename,
		File:        req.File,
		FileURL:     project.FileURL,
	}

	return ctx.JSON(http.StatusCreated, res)
}

// Get Project(for all users)
func (ctrl *Controller) handleGetProject(ctx echo.Context) error {
	id := ctx.Param("id")
	reqID := uuid.MustParse(id)

	project, err := ctrl.contentClient.GetProject(reqID)
	if err != nil {
		ctrl.log.Error("failed to get project", zap.String("id", id), zap.Error(err))
		return ctx.JSON(http.StatusInternalServerError, err.Error())
	}

	str := base64.StdEncoding.EncodeToString(project.File)
	res := models.ProjectResponse{
		ID:          project.ID,
		Title:       project.Title,
		Description: project.Description,
		UploadedBy:  project.ID,
		CreatedAt:   project.CreatedAt,
		UpdatedAt:   project.UpdatedAt,
		Filename:    project.Filename,
		File:        str,
		FileURL:     project.FileURL,
	}

	return ctx.JSON(http.StatusOK, res)
}

// Update project(onle for editor and admin)
func (ctrl *Controller) handleUpdateProject(ctx echo.Context) error {
	id := ctx.Param("id")
	reqID := uuid.MustParse(id)
	var req models.UpdateProjectRequestHTTP
	if err := ctx.Bind(&req); err != nil {
		ctrl.log.Error("failed to bind update project request", zap.Error(err))
		return ctx.JSON(http.StatusBadRequest, err.Error())
	}
	user_id, role, err := ctrl.getUserDataFromToken(ctx)
	if err != nil {
		ctrl.log.Error("failed to get token from header", zap.Error(err))
		return ctx.JSON(http.StatusForbidden, "unforbidden")
	}

	if role != editorRole && role != adminRole {
		ctrl.log.Error("failed to get token from header", zap.Error(err))
		return ctx.JSON(http.StatusForbidden, "unforbidden")
	}

	dto := models.UpdateProjectRequest{
		ID:          reqID,
		Title:       req.Title,
		Description: req.Description,
		UploadedBy:  user_id,
	}

	project, err := ctrl.contentClient.UpdateProject(dto)
	if err != nil {
		ctrl.log.Error("failed to update project", zap.Error(err))
		return ctx.JSON(http.StatusInternalServerError, err.Error())
	}

	return ctx.JSON(http.StatusOK, project)
}

func (ctrl *Controller) handleDeleteProject(ctx echo.Context) error {
	id := ctx.Param("id")
	reqID := uuid.MustParse(id)

	message, err := ctrl.contentClient.DeleteProject(reqID)
	if err != nil {
		ctrl.log.Error("failed to delete project", zap.String("id", id), zap.Error(err))
		return ctx.JSON(http.StatusInternalServerError, err.Error())
	}

	return ctx.JSON(http.StatusOK, map[string]string{"message": message})
}

func (ctrl *Controller) handleListProjects(ctx echo.Context) error {
	limit, _ := strconv.Atoi(ctx.QueryParam("limit"))
	offset, _ := strconv.Atoi(ctx.QueryParam("offset"))

	projects, err := ctrl.contentClient.ListProjects(int32(limit), int32(offset))
	if err != nil {
		ctrl.log.Error("failed to list projects", zap.Error(err))
		return ctx.JSON(http.StatusInternalServerError, err.Error())
	}

	return ctx.JSON(http.StatusOK, projects)
}
