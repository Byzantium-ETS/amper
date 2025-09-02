package auth

import (
	"fmt"
	"lsat/macaroon"
	"os"
	"path/filepath"
	"strings"

	"github.com/lightningnetwork/lnd/lntypes"
)

// Constants
const (
	baseFileName = "l402.token."
)

// TokenStore defines the interface for storing and retrieving tokens.
type TokenStore interface {
	// Stores the provided token with the specified ID in the store.
	StoreToken(macaroon.TokenId, macaroon.Token) error

	// Returns a reference to the token stored in the store for the specified ID.
	GetToken(macaroon.TokenId) (*macaroon.Token, error)

	// Removes the token from the store
	RemoveToken(macaroon.TokenId) (*macaroon.Token, error)
}

// LocalStore implements the TokenStore interface using local file storage.
type LocalStore struct {
	directory string
}

// Create a new LocalStore.
func NewStore(directory string) (*LocalStore, error) {
	// If the target path for the token store doesn't exist, then we'll
	// create it now before we proceed.
	if !fileExists(directory) {
		if err := os.MkdirAll(directory, 0700); err != nil {
			return nil, err
		}
	}

	return &LocalStore{directory}, nil
}

// Saves the token to a file.
func (store *LocalStore) StoreToken(id macaroon.TokenId, token macaroon.Token) error {
	// Construct the file path
	filePath := store.FilePath(id)

	// Write the token to the file using Macaroon.String() for formatting
	data := fmt.Sprintf(
		"%s\npreimage %s",
		token.Macaroon.String(),
		token.Preimage.String(),
	)
	err := os.WriteFile(filePath, []byte(data), 0644)
	if err != nil {
		return fmt.Errorf("failed to write token to file: %v", err)
	}

	return nil
}

// GetToken reads the token from a file where it should be saved and returns the token object.
func (store *LocalStore) GetToken(id macaroon.TokenId) (*macaroon.Token, error) {
	// Construct the file path
	filePath := store.FilePath(id)

	return store.GetTokenFromPath(filePath)
}

func (store *LocalStore) GetTokenFromPath(filePath string) (*macaroon.Token, error) {
	// Read the token data from the file
	data, err := os.ReadFile(filePath)
	if err != nil {
		return nil, fmt.Errorf("failed to read token file: %v", err)
	}

	// Split the token data into lines
	lines := strings.Split(string(data), "\n")
	// if len(lines) < 6 {
	// 	return nil, fmt.Errorf("invalid token format")
	// }

	// Deserialize the macaroon from the lines
	mac, err := macaroon.Deserialize([]byte(strings.Join(lines[:len(lines)-1], "\n")))
	if err != nil {
		return nil, fmt.Errorf("failed to deserialize macaroon: %v", err)
	}

	// Parse the preimage from the last line
	preimageLine := lines[len(lines)-1]
	if !strings.HasPrefix(preimageLine, "preimage ") {
		return nil, fmt.Errorf("missing preimage")
	}
	preimage, err := lntypes.MakePreimageFromStr(strings.TrimPrefix(preimageLine, "preimage "))
	if err != nil {
		return nil, fmt.Errorf("failed to parse preimage: %v", err)
	}

	return &macaroon.Token{
		Macaroon: mac,
		Preimage: preimage,
	}, nil
}

func (store *LocalStore) RemoveToken(id macaroon.TokenId) (*macaroon.Token, error) {
	token, err := store.GetToken(id)
	if err != nil {
		return nil, err
	}

	err = os.Remove(store.FilePath(id))
	if err != nil {
		return nil, err
	}

	return token, nil
}

func (store *LocalStore) FilePath(id macaroon.TokenId) string {
	return filepath.Join(store.directory, baseFileName+id.Hash.String())
}

// fileExists returns true if the file exists, and false otherwise.
func fileExists(path string) bool {
	if _, err := os.Stat(path); err != nil {
		if os.IsNotExist(err) {
			return false
		}
	}

	return true
}
