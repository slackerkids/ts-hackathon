package gateway

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

const (
	SchoolAuthURL    = "https://01.tomorrow-school.ai/api/auth/signin"
	SchoolGraphQLURL = "https://01.tomorrow-school.ai/api/graphql-engine/v1/graphql"
)

type SchoolGateway struct {
	client *http.Client
}

func NewSchoolGateway() *SchoolGateway {
	return &SchoolGateway{client: &http.Client{}}
}

// SchoolProfile represents the user profile from the school API.
type SchoolProfile struct {
	ID        int    `json:"id"`
	Login     string `json:"login"`
	FirstName string `json:"firstName"`
	LastName  string `json:"lastName"`
	Email     string `json:"email"`
}

// SchoolLevel represents XP level from the school API.
type SchoolLevel struct {
	Level      int     `json:"level"`
	AuditRatio float64 `json:"auditRatio"`
}

// Authenticate authenticates with the school API using Basic Auth and returns a JWT.
func (g *SchoolGateway) Authenticate(username, password string) (string, error) {
	credentials := base64.StdEncoding.EncodeToString([]byte(username + ":" + password))

	req, err := http.NewRequest("POST", SchoolAuthURL, nil)
	if err != nil {
		return "", fmt.Errorf("failed to create request: %w", err)
	}
	req.Header.Set("Authorization", "Basic "+credentials)

	resp, err := g.client.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to call school auth: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("school auth failed with status %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("failed to read response: %w", err)
	}

	// The API returns a JWT string (possibly quoted)
	token := string(body)
	// Remove surrounding quotes if present
	if len(token) > 2 && token[0] == '"' && token[len(token)-1] == '"' {
		token = token[1 : len(token)-1]
	}

	return token, nil
}

// FetchProfile fetches the user profile from the school GraphQL API.
func (g *SchoolGateway) FetchProfile(jwt string) (*SchoolProfile, error) {
	query := `{ user { id login firstName lastName email } }`

	var result struct {
		Data struct {
			User []SchoolProfile `json:"user"`
		} `json:"data"`
	}

	if err := g.graphQL(jwt, query, nil, &result); err != nil {
		return nil, err
	}

	if len(result.Data.User) == 0 {
		return nil, fmt.Errorf("no user data returned from school")
	}

	return &result.Data.User[0], nil
}

// FetchLevel fetches the user's XP level and audit ratio from the school GraphQL API.
func (g *SchoolGateway) FetchLevel(jwt string, login string) (*SchoolLevel, error) {
	query := `query GetEventUserLevelsByLogin($login: String!) {
		core: event_user(
			where: {eventId: {_eq: 96}, publicUser: {login: {_eq: $login}}}
			order_by: {userAuditRatio: desc}
		) {
			level
			userAuditRatio
		}
	}`

	vars := map[string]any{"login": login}

	var result struct {
		Data struct {
			Core []struct {
				Level          int     `json:"level"`
				UserAuditRatio float64 `json:"userAuditRatio"`
			} `json:"core"`
		} `json:"data"`
	}

	if err := g.graphQL(jwt, query, vars, &result); err != nil {
		return nil, err
	}

	level := &SchoolLevel{}
	if len(result.Data.Core) > 0 {
		level.Level = result.Data.Core[0].Level
		level.AuditRatio = result.Data.Core[0].UserAuditRatio
	}

	return level, nil
}

// FetchXP fetches total XP from the school GraphQL API.
func (g *SchoolGateway) FetchXP(jwt string, userID int) (int64, error) {
	query := `query GetUserTransactions($userId: Int!) {
		transaction(where: {userId: {_eq: $userId}, type: {_eq: "xp"}}) {
			amount
		}
	}`

	vars := map[string]any{"userId": userID}

	var result struct {
		Data struct {
			Transaction []struct {
				Amount int64 `json:"amount"`
			} `json:"transaction"`
		} `json:"data"`
	}

	if err := g.graphQL(jwt, query, vars, &result); err != nil {
		return 0, err
	}

	var total int64
	for _, t := range result.Data.Transaction {
		total += t.Amount
	}

	return total, nil
}

func (g *SchoolGateway) graphQL(jwt, query string, variables map[string]any, dest any) error {
	body := map[string]any{"query": query}
	if variables != nil {
		body["variables"] = variables
	}

	jsonBody, err := json.Marshal(body)
	if err != nil {
		return fmt.Errorf("failed to marshal query: %w", err)
	}

	req, err := http.NewRequest("POST", SchoolGraphQLURL, bytes.NewReader(jsonBody))
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+jwt)

	resp, err := g.client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to call school graphql: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("school graphql failed with status %d", resp.StatusCode)
	}

	return json.NewDecoder(resp.Body).Decode(dest)
}
