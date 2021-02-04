package api

import (
	"context"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/virtual-vgo/vvgo/pkg/discord"
	"github.com/virtual-vgo/vvgo/pkg/sheets"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestSlashCommand(t *testing.T) {
	ts := httptest.NewServer(http.HandlerFunc(HandleSlashCommand))
	req, err := http.NewRequest(http.MethodPost, ts.URL, strings.NewReader(`{"type":1}`))
	require.NoError(t, err, "http.NewRequest() failed")
	req.Header.Set("X-Signature-Ed25519", "acbd")
	req.Header.Set("X-Signature-Timestamp", "1234")
	resp, err := http.DefaultClient.Do(req)
	assert.NoError(t, err, "http.Do()")
	assert.Equal(t, http.StatusUnauthorized, resp.StatusCode, "status code")
}

func TestHandleBeepInteraction(t *testing.T) {
	interaction := discord.Interaction{
		Type: discord.InteractionTypeApplicationCommand,
		Data: &discord.ApplicationCommandInteractionData{
			Name: "beep",
		},
	}
	response, ok := HandleInteraction(context.Background(), interaction)
	assert.True(t, ok)
	assertEqualInteractionResponse(t, discord.InteractionResponse{
		Type: discord.InteractionResponseTypeChannelMessageWithSource,
		Data: &discord.InteractionApplicationCommandCallbackData{Content: "boop"},
	}, response)
}

func TestHandlePartsInteraction(t *testing.T) {
	ctx := context.Background()
	sheets.WriteValuesToRedis(ctx, sheets.WebsiteDataSpreadsheetID(ctx), "Projects", [][]interface{}{
		{"Name", "Title", "Parts Released"},
		{"10-hildas-healing", "Hilda's Healing", true},
	})

	interaction := discord.Interaction{
		Type: discord.InteractionTypeApplicationCommand,
		Data: &discord.ApplicationCommandInteractionData{
			Name: "parts",
			Options: []discord.ApplicationCommandInteractionDataOption{
				{Name: "project", Value: "10-hildas-healing"},
			},
		},
	}

	response, ok := HandleInteraction(ctx, interaction)
	assert.True(t, ok)

	assertEqualInteractionResponse(t, discord.InteractionResponse{
		Type: discord.InteractionResponseTypeChannelMessage,
		Data: &discord.InteractionApplicationCommandCallbackData{
			Content: "[Parts for Hilda's Healing](https://vvgo.org/parts?project=10-hildas-healing)",
		},
	}, response)
}

func TestHandleSubmissionInteraction(t *testing.T) {
	ctx := context.Background()
	sheets.WriteValuesToRedis(ctx, sheets.WebsiteDataSpreadsheetID(ctx), "Projects", [][]interface{}{
		{"Name", "Title", "Parts Released", "Submission Link"},
		{"10-hildas-healing", "Hilda's Healing", true, "https://bit.ly/vvgo10submit"},
	})

	interaction := discord.Interaction{
		Type: discord.InteractionTypeApplicationCommand,
		Data: &discord.ApplicationCommandInteractionData{
			Name: "submit",
			Options: []discord.ApplicationCommandInteractionDataOption{
				{Name: "project", Value: "10-hildas-healing"},
			},
		},
	}

	response, ok := HandleInteraction(ctx, interaction)
	assert.True(t, ok)

	assertEqualInteractionResponse(t, discord.InteractionResponse{
		Type: discord.InteractionResponseTypeChannelMessage,
		Data: &discord.InteractionApplicationCommandCallbackData{
			Content: "[Submit here](https://bit.ly/vvgo10submit) for Hilda's Healing.",
		},
	}, response)
}

func assertEqualInteractionResponse(t *testing.T, want, got discord.InteractionResponse) {
	assert.Equal(t, want.Type, got.Type, "interaction.Type")
	assert.Equal(t, want.Data, got.Data, "interaction.Data")
}