package gateway

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"
)

type TelegramGateway struct {
	botToken string
	client   *http.Client
}

func NewTelegramGateway(botToken string) *TelegramGateway {
	return &TelegramGateway{
		botToken: botToken,
		client:   &http.Client{Timeout: 10 * time.Second},
	}
}

type sendMessageRequest struct {
	ChatID    int64  `json:"chat_id"`
	Text      string `json:"text"`
	ParseMode string `json:"parse_mode,omitempty"`
}

// SendMessage sends a text message to a specific Telegram chat.
func (g *TelegramGateway) SendMessage(chatID int64, text string) error {
	body := sendMessageRequest{
		ChatID:    chatID,
		Text:      text,
		ParseMode: "HTML",
	}
	jsonBody, err := json.Marshal(body)
	if err != nil {
		return err
	}

	url := fmt.Sprintf("https://api.telegram.org/bot%s/sendMessage", g.botToken)
	resp, err := g.client.Post(url, "application/json", bytes.NewReader(jsonBody))
	if err != nil {
		return fmt.Errorf("telegram send failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("telegram API returned status %d", resp.StatusCode)
	}
	return nil
}

// Broadcast sends a message to a list of chat IDs (fire-and-forget).
func (g *TelegramGateway) Broadcast(chatIDs []int64, text string) {
	for _, id := range chatIDs {
		go func(chatID int64) {
			if err := g.SendMessage(chatID, text); err != nil {
				log.Printf("Failed to send to %d: %v", chatID, err)
			}
		}(id)
	}
}
