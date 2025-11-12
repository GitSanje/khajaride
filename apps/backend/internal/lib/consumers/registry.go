package consumers

import "fmt"

type JobRegistry struct {
	jobs map[string]Job
}

func NewJobRegistry(brokers []string) *JobRegistry {
	registry := &JobRegistry{
		jobs: make(map[string]Job),
	}
	// Register Kafka payout job
	registry.Register(NewKafkaPayoutJob(brokers, "payout_requested", "payout_workers_group"))

	return registry
}

func (r *JobRegistry) Register(job Job) {
	r.jobs[job.Name()] = job
}

func (r *JobRegistry) List() []string {
	names := make([]string, 0, len(r.jobs))
	for name := range r.jobs {
		names = append(names, name)
	}
	return names
}

func (r *JobRegistry) Get(name string) (Job, error) {
	job, exists := r.jobs[name]
	if !exists {
		return nil, fmt.Errorf("job '%s' not found", name)
	}
	return job, nil
}