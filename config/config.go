package config

import (
	"log"
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
	err := godotenv.Load()
	if err != nil {
    	log.Fatal("Error loading .env file")
	}
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