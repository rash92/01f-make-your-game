package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"sort"
	"sync"

	"github.com/gorilla/websocket"
)

type Score struct {
	Player string `json:"player"`
	Score  int    `json:"score"`
	Time   int    `json:"time"`
}

var (
	upgrader = websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
		CheckOrigin: func(r *http.Request) bool {
			return true
		},
	}
	scores = make([]Score, 0)
	mu     sync.Mutex
)

func main() {
	loadInitialScores()

	http.HandleFunc("/ws", wsHandler)
	http.ListenAndServe(":8080", nil)
}

func loadInitialScores() {
	data, err := os.ReadFile("scores.json")
	if err != nil {
		fmt.Println("Error reading scores json file: ", err)
		return
	}
	if err := json.Unmarshal(data, &scores); err != nil {
		fmt.Println("Error unmarshalling scores file:", err)
	}

	sort.Slice(scores, func(i, j int) bool {
		return scores[i].Score > scores[j].Score
	})
}

func wsHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Println("Uprader Error: ", err)
		return
	}
	data, err := json.Marshal(scores)
	if err != nil {
		fmt.Println("Marshalling Error: ", err)
	} else if err := conn.WriteMessage(websocket.TextMessage, data); err != nil {
		return
	}
	for {
		_, p, err := conn.ReadMessage()
		if err != nil {
			return
		}
		var newScore Score
		if err := json.Unmarshal(p, &newScore); err != nil {
			fmt.Println("Unmarshalling Error: ", err)
			return
		}

		mu.Lock()
		scores = append(scores, newScore)
		sort.Slice(scores, func(i, j int) bool {
			return scores[i].Score > scores[j].Score
		})
		mu.Unlock()
		data, err := json.Marshal(scores)
		if err != nil {
			fmt.Println("Marshalling Error: ", err)
			continue
		}
		fmt.Println("Sending Data...")
		if err := conn.WriteMessage(websocket.TextMessage, data); err != nil {
			return
		}
	}
}
