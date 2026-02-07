package gateway

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

type AIGateway struct {
	apiKey string
	client *http.Client
}

func NewAIGateway(apiKey string) *AIGateway {
	return &AIGateway{
		apiKey: apiKey,
		client: &http.Client{Timeout: 30 * time.Second},
	}
}

func (g *AIGateway) IsConfigured() bool {
	return g.apiKey != ""
}

type chatMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type chatRequest struct {
	Model    string        `json:"model"`
	Messages []chatMessage `json:"messages"`
}

type chatChoice struct {
	Message chatMessage `json:"message"`
}

type chatResponse struct {
	Choices []chatChoice `json:"choices"`
}

func (g *AIGateway) Summarize(title, content string) (string, error) {
	if !g.IsConfigured() {
		return "", fmt.Errorf("AI not configured: OPENAI_API_KEY is not set")
	}

	body := chatRequest{
		Model: "gpt-4o-mini",
		Messages: []chatMessage{
			{
				Role:    "system",
				Content: "You are a helpful assistant. Summarize the following news article in 2-3 concise sentences. Reply only with the summary, no additional text.",
			},
			{
				Role:    "user",
				Content: fmt.Sprintf("Title: %s\n\n%s", title, content),
			},
		},
	}

	jsonBody, err := json.Marshal(body)
	if err != nil {
		return "", err
	}

	req, err := http.NewRequest("POST", "https://api.openai.com/v1/chat/completions", bytes.NewReader(jsonBody))
	if err != nil {
		return "", err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+g.apiKey)

	resp, err := g.client.Do(req)
	if err != nil {
		return "", fmt.Errorf("AI API request failed: %w", err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("AI API returned status %d: %s", resp.StatusCode, string(respBody))
	}

	var chatResp chatResponse
	if err := json.Unmarshal(respBody, &chatResp); err != nil {
		return "", err
	}

	if len(chatResp.Choices) == 0 {
		return "", fmt.Errorf("AI returned no choices")
	}

	return chatResp.Choices[0].Message.Content, nil
}
