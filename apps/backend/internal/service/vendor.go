package service

import (
	"mime/multipart"
	"net/http"

	"github.com/gitSanje/khajaride/internal/lib/aws"
	"github.com/gitSanje/khajaride/internal/lib/utils"
	"github.com/gitSanje/khajaride/internal/middleware"
	"github.com/gitSanje/khajaride/internal/model"
	"github.com/gitSanje/khajaride/internal/model/vendor"
	"github.com/gitSanje/khajaride/internal/repository"
	"github.com/gitSanje/khajaride/internal/server"
	"github.com/labstack/echo/v4"
)


type VendorService struct {

  server *server.Server
  vendorRepo *repository.VendorRepository
  awsClient    *aws.AWS
}

func NewVendorService(s *server.Server, vendorRepo *repository.VendorRepository, awsClient *aws.AWS) *VendorService {
	return &VendorService{
		server:  s,
		vendorRepo: vendorRepo,
        awsClient:    awsClient,
	}
}


func ( s *VendorService) GetVendorByID( ctx echo.Context, payload *vendor.GetVendorByIDPayload )  (*vendor.VendorPopulated, error){

	logger := middleware.GetLogger(ctx)


	v, err := s.vendorRepo.GetVendorByID(ctx.Request().Context(), payload)
	if err != nil {
        logger.Error().Err(err).Str("vendorID", payload.ID).Msg("Failed to fetch vendor  by ID")
        return nil, err
    }
        logger.Info().Str("vendorID", payload.ID).Msg("Vendor  fetched successfully")
    
    return  v,nil
}

func ( s *VendorService) CreateVendorInBulk ( ctx echo.Context, payload []byte )  error{

	vendorBulkInputs, err := utils.TransformFoodManduVendors(payload)
	if err != nil {
      return  err
	}
	if err := s.vendorRepo.BulkInsertVendors(ctx.Request().Context(), vendorBulkInputs); err != nil {
		return  err
	}
    
    return  nil
}


func ( s *VendorService) CreateMenuItemsInBulk ( ctx echo.Context, payload []byte )  error{

	menuItemBulkInputs,categoryBulkInputs,vendorcategories , err := utils.TransformFoodManduMenuItems(payload)
	if err != nil {
      return  err
	}
	if err := s.vendorRepo.BulkInsertMenuData(ctx.Request().Context(), categoryBulkInputs, menuItemBulkInputs ,vendorcategories); err != nil {
		return  err
	}
    
    return  nil
}


func (s *VendorService) GetVendors(ctx echo.Context, query *vendor.GetVendorsQuery) (*model.PaginatedResponse[vendor.Vendor], error) {
    logger := middleware.GetLogger(ctx)

    
    
    vendorsPage, err := s.vendorRepo.GetVendors(ctx.Request().Context(), query)
    if err != nil {
        logger.Error().Err(err).Msg("Failed to fetch users from repository")
        return nil, err
    }

    logger.Info().
        Int("page", vendorsPage.Page).
        Int("limit", vendorsPage.Limit).
        Int("total", vendorsPage.Total).
        Int("totalPages", vendorsPage.TotalPages).
        Msg("Users fetched successfully")

    return vendorsPage, nil
}



func (s *VendorService) CreateVendor(ctx echo.Context, payload *vendor.CreateVendorPayload) (*vendor.Vendor, error) {
    logger := middleware.GetLogger(ctx)

    
    vendor, err := s.vendorRepo.CreateVendor(ctx.Request().Context(), payload)
    if err != nil {
        logger.Error().Err(err).Msg("Failed to fetch create vendor")
        return nil, err
    }

    return vendor, nil
}



func (s *VendorService) CreateVendorAddress(ctx echo.Context, payload *vendor.CreateVendorAddressPayload) (*vendor.VendorAddress, error) {
    logger := middleware.GetLogger(ctx)

    
    vendor, err := s.vendorRepo.CreateVendorAddress(ctx.Request().Context(), payload)
    if err != nil {
        logger.Error().Err(err).Msg("Failed to fetch create vendor address")
        return nil, err
    }

    return vendor, nil
}

func (s *VendorService) UploadImages(ctx echo.Context,files []*multipart.FileHeader) (*vendor.UploadImagesResponse, error) {
    logger := middleware.GetLogger(ctx)
    
    var uploadedURLs []string


    for _, file := range files {
		// Open the file
		src, err := file.Open()
		if err != nil {
			logger.Error().Err(err).Msg("Failed to open file")
			return nil, err
		}
		defer src.Close() // make sure to close the file

		// Upload to S3
		publicURL, err := s.awsClient.S3.UploadPublicFile(
			ctx.Request().Context(),
			s.server.Config.AWS.UploadBucket,
			"vendors/images/"+file.Filename,
			src,
		)
		if err != nil {
			logger.Error().Err(err).Msg("Failed to upload file to S3")
			return nil, err
		}

		uploadedURLs = append(uploadedURLs, publicURL)
	}
    imageRes := &vendor.UploadImagesResponse{
		UploadedURLs: uploadedURLs,
	}
	return imageRes, nil
}


func (s *VendorService) GetVendorByUserID(ctx echo.Context, vendorUserID string) (*vendor.VendorWithAddress, error) {
	logger := middleware.GetLogger(ctx)

	data, err := s.vendorRepo.GetVendorByUserID(ctx.Request().Context(), vendorUserID)
	if err != nil {
		logger.Error().Err(err).Str("vendorUserID", vendorUserID).Msg("Failed to fetch vendor by vendor_user_id")
		return nil, err
	}

	if data == nil {
		logger.Warn().Str("vendorUserID", vendorUserID).Msg("Vendor not found")
		return nil, echo.NewHTTPError(http.StatusNotFound, "Vendor not found")
	}

	logger.Info().Str("vendorID", data.Vendor.ID).Msg("Vendor fetched successfully")
	return data, nil
}
