package gateway

// TelegramGateway is a placeholder for future Telegram Bot API interactions
// such as sending push notifications via the bot.
type TelegramGateway struct {
	botToken string
}

func NewTelegramGateway(botToken string) *TelegramGateway {
	return &TelegramGateway{botToken: botToken}
}
