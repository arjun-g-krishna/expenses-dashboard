package config

import (
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
    DBHost     string
    DBPort     string
    DBUser     string
    DBPassword string
    DBName     string
    DBSSLMode  string
}

func LoadConfig() Config {
	// Non-fatal: if .env doesn't exist, fall back to real env vars
	_ = godotenv.Load()
    return Config {
        DBHost:     os.Getenv("DB_HOST",),
        DBPort:     os.Getenv("DB_PORT"),
        DBUser:     os.Getenv("DB_USER"),
        DBPassword: os.Getenv("DB_PASSWORD"),
        DBName:     os.Getenv("DB_NAME"),
        DBSSLMode:  os.Getenv("DB_SSLMODE"),
    }
}

func (c Config) GetDSN() string {
    return "postgres://" + c.DBUser + ":" + c.DBPassword +
        "@" + c.DBHost + ":" + c.DBPort + "/" + c.DBName +
        "?sslmode=" + c.DBSSLMode
}