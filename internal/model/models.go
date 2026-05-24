package model

import "time"

type User struct {
    ID        int       `json:"id"`
    Email     string    `json:"email"`
    Password  string    `json:"-"` 
    Name      string    `json:"name"`
    CreatedAt time.Time `json:"created_at"`
}

type Expense struct {
}

