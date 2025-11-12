package consumers

import (
	"context"
	"fmt"

	"github.com/gitSanje/khajaride/internal/config"
	"github.com/gitSanje/khajaride/internal/database"
	"github.com/gitSanje/khajaride/internal/logger"
	"github.com/gitSanje/khajaride/internal/repository"
	"github.com/gitSanje/khajaride/internal/server"
	"github.com/redis/go-redis/v9"
)


type Job interface {
	Name() string
	Description() string
	Run(ctx context.Context, jobCtx *JobContext) error
}


type JobContext struct {
	Config        *config.Config
	Server        *server.Server

	Repositories  *repository.Repositories
	LoggerService *logger.LoggerService
}

func NewJobContext() (*JobContext, error) {
	cfg, err := config.LoadConfig()
	if err != nil {
		return nil, fmt.Errorf("failed to load config: %w", err)
	}

	loggerService := logger.NewLoggerService(cfg.Observability)
	loggerInstance := logger.NewLoggerWithService(cfg.Observability, loggerService)

	db, err := database.New(cfg, &loggerInstance, loggerService)
	if err != nil {
		return nil, fmt.Errorf("failed to initialize database: %w", err)
	}

	redisClient := redis.NewClient(&redis.Options{
		Addr:     cfg.Redis.Address,
		// Password: cfg.Redis.Password,
		DB:       0,
	})

	srv := &server.Server{
		Config:        cfg,
		Logger:        &loggerInstance,
		LoggerService: loggerService,
		DB:            db,
		Redis:         redisClient,
	}


	repositories := repository.NewRepositories(srv)

	return &JobContext{
		Config:        cfg,
		Server:        srv,
		Repositories:  repositories,
		LoggerService: loggerService,
	}, nil
}


func (c *JobContext) Close() {
	if c.Server != nil && c.Server.DB != nil {
		c.Server.DB.Pool.Close()
	}
	if c.Server != nil && c.Server.Redis != nil {
		c.Server.Redis.Close()
	}
	if c.LoggerService != nil {
		c.LoggerService.Shutdown()
	}
}


type JobRunner struct {
	job    Job
	jobCtx *JobContext
}

func NewJobRunner(job Job) (*JobRunner, error) {
	jobCtx, err := NewJobContext()
	if err != nil {
		return nil, fmt.Errorf("failed to create job context: %w", err)
	}

	return &JobRunner{
		job:    job,
		jobCtx: jobCtx,
	}, nil
}

func (r *JobRunner) Run() error {
	defer r.jobCtx.Close()

	r.jobCtx.Server.Logger.Info().
		Str("job", r.job.Name()).
		Msg("Starting consumer")

	ctx := context.Background()
	err := r.job.Run(ctx, r.jobCtx)
	if err != nil {
		r.jobCtx.Server.Logger.Error().
			Err(err).
			Str("job", r.job.Name()).
			Msg("Failed to run consumer ")
		return err
	}

	r.jobCtx.Server.Logger.Info().
		Str("job", r.job.Name()).
		Msg("consumer job completed successfully")
	return nil
}