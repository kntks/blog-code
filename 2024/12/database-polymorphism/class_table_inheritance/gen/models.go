// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.27.0

package gen

type BugTicket struct {
	TicketID  int64
	BugReport string
}

type FeatureTicket struct {
	TicketID       int64
	FeatureRequest string
}

type Ticket struct {
	ID          int64
	Title       string
	Description string
}
