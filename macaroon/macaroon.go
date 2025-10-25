package macaroon

import (
	"encoding/base64"
	"errors"
	"fmt"
	"lsat/secrets"
	"strings"

	"github.com/lightningnetwork/lnd/lntypes"
)

// Version is an alias for the Macaroon version.
type Version = int8

// Macaroon struct represents an LSAT (Lightning Service Authentication Token) macaroon.
type Macaroon struct {
	userId    secrets.UserID
	caveats   []Caveat
	signature lntypes.Hash
}

// Uid returns the user ID associated with the macaroon.
func (mac *Macaroon) UserId() secrets.UserID {
	return mac.userId
}

// func (mac *Macaroon) Services() service ServiceIterator {
// 	return ServiceIterator{caveats: mac.caveats}
// }

// Caveats returns the list of caveats associated with the macaroon.
func (mac *Macaroon) Caveats() []Caveat {
	return mac.caveats
}

// Signature returns the signature of the macaroon.
func (mac *Macaroon) Signature() lntypes.Hash {
	return mac.signature
}

// Returns the Value of the caveat with the given Key
func (mac *Macaroon) GetValue(key string) ValueIterator {
	return NewIterator(key, mac.caveats)
}

func (mac Macaroon) String() string {
	var sb strings.Builder

	// Write the identifier
	fmt.Fprintf(&sb, "identifier %s\n", mac.userId.String())

	// Write the caveats as key-value pairs
	for _, caveat := range mac.caveats {
		fmt.Fprintf(&sb, "%s %s\n", caveat.Key, caveat.Value)
	}

	// Write the signature
	fmt.Fprintf(&sb, "signature %s", mac.signature.String())

	return sb.String()
}

// EncodedString returns the base64-encoded string representation of the Macaroon.
func (mac Macaroon) EncodedString() string {
	return base64.StdEncoding.EncodeToString([]byte(mac.String()))
}

// Create an oven from a Macaroon.
//
// This is used for adding third party caveats.
func (mac *Macaroon) Oven() Oven {
	root, _ := secrets.MakeSecret(mac.signature[:])
	return Oven{
		root:     root,
		userId:   mac.userId,
		macaroon: mac,
	}
}

// Deserialize decodes a base64-encoded macaroon string into a Macaroon struct.
func Deserialize(data []byte) (Macaroon, error) {
	// Split the string into lines
	lines := strings.Split(string(data), "\n")
	if len(lines) < 2 {
		return Macaroon{}, errors.New("invalid macaroon format")
	}

	// Parse the identifier
	var err error
	var userId secrets.UserID
	if identifier, found := strings.CutPrefix(lines[0], "identifier "); found {
		userId, err = secrets.MakeUserIdFromStr(identifier)
		if err != nil {
			return Macaroon{}, err
		}
	} else {
		return Macaroon{}, errors.New("missing identifier")
	}

	// Parse the caveats
	var caveats []Caveat
	for _, line := range lines[1 : len(lines)-1] {
		parts := strings.SplitN(line, " ", 2)
		if len(parts) != 2 {
			return Macaroon{}, errors.New("invalid caveat format")
		}
		caveats = append(caveats, Caveat{Key: parts[0], Value: parts[1]})
	}

	// Parse the signature
	var signature lntypes.Hash
	if signatureLine, found := strings.CutPrefix(lines[len(lines)-1], "signature "); found {
		signature, err = lntypes.MakeHashFromStr(signatureLine)
		if err != nil {
			return Macaroon{}, err
		}
	} else {
		return Macaroon{}, errors.New("missing signature")
	}

	// Create and return the Macaroon struct
	return Macaroon{
		userId:    userId,
		caveats:   caveats,
		signature: signature,
	}, nil
}
