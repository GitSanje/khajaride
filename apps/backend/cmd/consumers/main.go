package main

import (
	"fmt"
	"os"

	"github.com/gitSanje/khajaride/internal/lib/consumers"
	"github.com/spf13/cobra"
)

func main() {
	rootCmd := &cobra.Command{Use: "consumer"}

	// List available jobs
	listCmd := &cobra.Command{
		Use:   "list",
		Short: "List available worker jobs",
		Run: func(cmd *cobra.Command, args []string) {
			_ = consumers.NewJobRegistry([]string{"localhost:9092"})
		
		},
	}
	rootCmd.AddCommand(listCmd)

	// Create subcommands for each job
	registry := consumers.NewJobRegistry([]string{"localhost:9092"})
	for _, jobName := range registry.List() {
		job, _ := registry.Get(jobName)
		// Capture jobName in closure
		name := jobName
		jobCmd := &cobra.Command{
			Use:   job.Name(),
			Short: job.Description(),
			RunE: func(cmd *cobra.Command, args []string) error {
				return runJob(name)
			},
		}
		rootCmd.AddCommand(jobCmd)
	}

	if err := rootCmd.Execute(); err != nil {
		os.Exit(1)
	}
}

func runJob(jobName string) error {
	registry := consumers.NewJobRegistry([]string{"localhost:9092"})

	job, err := registry.Get(jobName)
	if err != nil {
		return fmt.Errorf("job '%s' not found", jobName)
	}

	runner, err := consumers.NewJobRunner(job)
	if err != nil {
		return fmt.Errorf("failed to create job runner: %w", err)
	}

	if err := runner.Run(); err != nil {
		return fmt.Errorf("job failed: %w", err)
	}

	return nil
}