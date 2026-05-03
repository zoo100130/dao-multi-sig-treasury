package main

import (
	"log"
	"net/http"
	"strconv"
	"sync"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

// Proposal represents a DAO proposal
type Proposal struct {
	ID          uint64    `json:"id"`
	TXID        uint64    `json:"txId"`
	Description string    `json:"description"`
	Target      string    `json:"target"`
	Value       string    `json:"value"`
	YesVotes    int       `json:"yesVotes"`
	NoVotes     int       `json:"noVotes"`
	VotingEnds  time.Time `json:"votingEnds"`
	Executed    bool      `json:"executed"`
	CreatedAt   time.Time `json:"createdAt"`
}

// Transaction represents a signed transaction
type Transaction struct {
	ID             uint64    `json:"id"`
	Target         string    `json:"target"`
	Value          string    `json:"value"`
	Data           string    `json:"data"`
	Confirmations  int       `json:"confirmations"`
	Executed       bool      `json:"executed"`
	CreatedAt      time.Time `json:"createdAt"`
}

// TreasuryStats represents treasury information
type TreasuryStats struct {
	Balance             string            `json:"balance"`
	TotalProposals     int               `json:"totalProposals"`
	ActiveProposals    int               `json:"activeProposals"`
	CompletedProposals int               `json:"completedProposals"`
	TotalDisbursed     string            `json:"totalDisbursed"`
	Assets             map[string]string `json:"assets"`
}

var (
	proposals  = make(map[uint64]*Proposal)
	proposalMu sync.RWMutex
	nextPropID uint64 = 1

	transactions  = make(map[uint64]*Transaction)
	transactionMu sync.RWMutex
	nextTXID      uint64 = 1
)

func main() {
	gin.SetMode(gin.ReleaseMode)
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173", "http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	r.GET("/health", healthHandler)

	v1 := r.Group("/api/v1")
	{
		v1.GET("/proposals", listProposals)
		v1.GET("/proposals/:id", getProposal)
		v1.POST("/proposals", createProposal)
		v1.POST("/proposals/:id/vote", voteProposal)
		v1.POST("/proposals/:id/sign", signTransaction)
		v1.POST("/proposals/:id/execute", executeProposal)
		v1.GET("/treasury", getTreasury)
		v1.GET("/transactions", listTransactions)
	}

	initializeMockData()

	log.Println("DAO Multi-Sig Backend running on http://localhost:8080")
	r.Run(":8080")
}

func healthHandler(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status":  "healthy",
		"service": "DAO Multi-Sig Treasury",
		"version": "1.0.0",
	})
}

func listProposals(c *gin.Context) {
	proposalMu.RLock()
	defer proposalMu.RUnlock()

	result := make([]*Proposal, 0, len(proposals))
	for _, p := range proposals {
		result = append(result, p)
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": result})
}

func getProposal(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid proposal ID"})
		return
	}

	proposalMu.RLock()
	defer proposalMu.RUnlock()

	if p, ok := proposals[id]; ok {
		c.JSON(http.StatusOK, gin.H{"success": true, "data": p})
		return
	}
	c.JSON(http.StatusNotFound, gin.H{"error": "Proposal not found"})
}

type CreateProposalRequest struct {
	Target      string `json:"target" binding:"required"`
	Value       string `json:"value" binding:"required"`
	Description string `json:"description" binding:"required"`
}

func createProposal(c *gin.Context) {
	var req CreateProposalRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	proposalMu.Lock()
	defer proposalMu.Unlock()

	now := time.Now()
	p := &Proposal{
		ID:          nextPropID,
		TXID:        nextTXID,
		Description: req.Description,
		Target:      req.Target,
		Value:       req.Value,
		YesVotes:    0,
		NoVotes:     0,
		VotingEnds:  now.Add(7 * 24 * time.Hour),
		Executed:    false,
		CreatedAt:   now,
	}
	proposals[nextPropID] = p
	nextPropID++

	transactionMu.Lock()
	transactions[nextTXID] = &Transaction{
		ID:        nextTXID,
		Target:    req.Target,
		Value:     req.Value,
		Data:      "0x",
		CreatedAt: now,
	}
	nextTXID++
	transactionMu.Unlock()

	c.JSON(http.StatusCreated, gin.H{"success": true, "data": p})
}

type VoteRequest struct {
	Vote int `json:"vote"`
}

func voteProposal(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid proposal ID"})
		return
	}

	var req VoteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	proposalMu.Lock()
	defer proposalMu.Unlock()

	p, ok := proposals[id]
	if !ok {
		c.JSON(http.StatusNotFound, gin.H{"error": "Proposal not found"})
		return
	}

	if p.Executed {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Proposal already executed"})
		return
	}

	if req.Vote > 0 {
		p.YesVotes++
	} else if req.Vote < 0 {
		p.NoVotes++
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": p})
}

func signTransaction(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid proposal ID"})
		return
	}

	transactionMu.Lock()
	defer transactionMu.Unlock()

	tx, ok := transactions[id]
	if !ok {
		c.JSON(http.StatusNotFound, gin.H{"error": "Transaction not found"})
		return
	}

	tx.Confirmations++
	if tx.Confirmations >= getThreshold(tx.Value) {
		tx.Executed = true
		proposalMu.Lock()
		for _, p := range proposals {
			if p.TXID == id {
				p.Executed = true
			}
		}
		proposalMu.Unlock()
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": tx})
}

func executeProposal(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid proposal ID"})
		return
	}

	proposalMu.Lock()
	defer proposalMu.Unlock()

	p, ok := proposals[id]
	if !ok {
		c.JSON(http.StatusNotFound, gin.H{"error": "Proposal not found"})
		return
	}

	if p.Executed {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Proposal already executed"})
		return
	}

	p.Executed = true
	transactionMu.Lock()
	if tx, ok := transactions[p.TXID]; ok {
		tx.Executed = true
	}
	transactionMu.Unlock()

	c.JSON(http.StatusOK, gin.H{"success": true, "data": p})
}

func getTreasury(c *gin.Context) {
	proposalMu.RLock()
	defer proposalMu.RUnlock()

	var active, completed int
	for _, p := range proposals {
		if p.Executed {
			completed++
		} else {
			active++
		}
	}

	stats := TreasuryStats{
		Balance:            "1,250,000.00 USDC",
		TotalProposals:     len(proposals),
		ActiveProposals:    active,
		CompletedProposals: completed,
		TotalDisbursed:     "450,000.00 USDC",
		Assets: map[string]string{
			"USDC": "1,200,000.00",
			"ETH":  "250.00",
			"DAO":  "50,000.00",
		},
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": stats})
}

func listTransactions(c *gin.Context) {
	transactionMu.RLock()
	defer transactionMu.RUnlock()

	result := make([]*Transaction, 0, len(transactions))
	for _, tx := range transactions {
		result = append(result, tx)
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": result})
}

func getThreshold(value string) int {
	v, _ := strconv.ParseFloat(value, 64)
	if v >= 100000 {
		return 5
	}
	if v >= 10000 {
		return 3
	}
	return 2
}

func initializeMockData() {
	proposalMu.Lock()
	transactionMu.Lock()
	defer proposalMu.Unlock()
	defer transactionMu.Unlock()

	now := time.Now()

	// Proposal 1
	proposals[1] = &Proposal{
		ID:          1,
		TXID:        1,
		Description: "資助開發團隊 Q2 季度預算 - 50,000 USDC",
		Target:      "0x742d35Cc6634C0532925a3b844Bc9e7595f2dE12",
		Value:       "50000",
		YesVotes:    4,
		NoVotes:     1,
		VotingEnds:  now.Add(3 * 24 * time.Hour),
		Executed:    false,
		CreatedAt:   now.Add(-4 * 24 * time.Hour),
	}
	transactions[1] = &Transaction{
		ID:            1,
		Target:        "0x742d35Cc6634C0532925a3b844Bc9e7595f2dE12",
		Value:         "50000",
		Data:          "0x",
		Confirmations: 0,
		Executed:      false,
		CreatedAt:     now.Add(-4 * 24 * time.Hour),
	}

	// Proposal 2
	proposals[2] = &Proposal{
		ID:          2,
		TXID:        2,
		Description: "行銷預算批准 - Twitter Space 活動費用 2,000 USDC",
		Target:      "0x1234567890abcdef1234567890abcdef12345678",
		Value:       "2000",
		YesVotes:    3,
		NoVotes:     0,
		VotingEnds:  now.Add(5 * 24 * time.Hour),
		Executed:    false,
		CreatedAt:   now.Add(-2 * 24 * time.Hour),
	}
	transactions[2] = &Transaction{
		ID:            2,
		Target:        "0x1234567890abcdef1234567890abcdef12345678",
		Value:         "2000",
		Data:          "0x",
		Confirmations: 0,
		Executed:      false,
		CreatedAt:     now.Add(-2 * 24 * time.Hour),
	}

	// Proposal 3 - Completed
	proposals[3] = &Proposal{
		ID:          3,
		TXID:        3,
		Description: "投資新項目 - DeFi 收益策略 100,000 USDC",
		Target:      "0x5678901234abcdef5678901234abcdef56789012",
		Value:       "100000",
		YesVotes:    5,
		NoVotes:     2,
		VotingEnds:  now.Add(-1 * 24 * time.Hour),
		Executed:    true,
		CreatedAt:   now.Add(-8 * 24 * time.Hour),
	}
	transactions[3] = &Transaction{
		ID:            3,
		Target:        "0x5678901234abcdef5678901234abcdef56789012",
		Value:         "100000",
		Data:          "0x",
		Confirmations: 5,
		Executed:      true,
		CreatedAt:     now.Add(-8 * 24 * time.Hour),
	}

	nextPropID = 4
	nextTXID = 4

	log.Println("Mock data initialized: 3 proposals")
}