package class_table_inheritance

type TicketType string

func (t TicketType) String() string {
	return string(t)
}

const (
	TicketTypeBug            TicketType = "bug"
	TicketTypeFeatureRequest TicketType = "featureRequest"
)

type BugTicket struct {
	ID          int64  `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	BugReport   string `json:"bugReport"`
}

type FeatureRequestTicket struct {
	ID             int64  `json:"id"`
	Title          string `json:"title"`
	Description    string `json:"description"`
	FeatureRequest string `json:"featureRequest"`
}
