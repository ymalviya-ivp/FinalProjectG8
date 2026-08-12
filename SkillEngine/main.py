import os
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Tuple
import numpy as np
import pandas as pd
import urllib.parse
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Vantage Quant Risk Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://localhost:7021"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- DATABASE CONFIGURATION ---
SERVER = os.getenv("DB_SERVER", "localhost")
DATABASE = os.getenv("DB_NAME", "VantageTradingDB")
USERNAME = os.getenv("DB_USER", "sa")
PASSWORD = os.getenv("DB_PASSWORD", "YourPassword123!")

# Create SQLAlchemy Engine for Pandas
params = urllib.parse.quote_plus(f"DRIVER={{ODBC Driver 17 for SQL Server}};SERVER={SERVER};DATABASE={DATABASE};UID={USERNAME};PWD={PASSWORD}")
engine = create_engine(f"mssql+pyodbc:///?odbc_connect={params}")

class Position(BaseModel):
    securityId: str
    netQuantity: float
    averageCost: float

class PortfolioRequest(BaseModel):
    asOfDate: str
    positions: List[Position]

def get_historical_volatility(security_id: str, end_date: str) -> Tuple[float, float]:
    try:
        # Your hardcoded start date
        start_date = '2026-02-02'
        
        # UPDATED: Checks between your hardcoded start date and the React dropdown date
        query = text("""
            SELECT PriceDate, ClosePrice 
            FROM G8.EOD_Prices 
            WHERE SecurityId = :sec_id 
              AND PriceDate >= :start_date 
              AND PriceDate <= :end_date
            ORDER BY PriceDate ASC
        """)
        
        # Pass all three variables safely into the SQL query
        df = pd.read_sql(query, engine, params={
            "sec_id": security_id, 
            "start_date": start_date,
            "end_date": end_date
        })
        
        if len(df) < 2:
            # Need at least 2 days to calculate volatility
            return 0.0, (0.15 / np.sqrt(252)) 
            
        df['DailyReturn'] = df['ClosePrice'].pct_change()
        real_volatility = df['DailyReturn'].std()
        expected_mean = df['DailyReturn'].mean()
            
        return expected_mean, real_volatility
        
    except Exception as e:
        print(f"Failed to fetch data for {security_id}: {e}")
        return 0.0, (0.15 / np.sqrt(252))

@app.post("/api/risk/var")
def calculate_portfolio_var(request: PortfolioRequest):
    try:
        if not request.positions:
            return {"totalPortfolioValue": 0, "var95": 0, "var99": 0}

        total_portfolio_value = 0
        portfolio_simulated_returns = np.zeros(10000)

        for pos in request.positions:
            position_value = pos.netQuantity * pos.averageCost
            total_portfolio_value += position_value

            # Fetch REAL historical statistics from the database
            expected_mean, daily_volatility = get_historical_volatility(pos.securityId, request.asOfDate)
            
            # Simulate 10,000 daily returns using real historical metrics
            simulated_security_returns = np.random.normal(expected_mean, daily_volatility, 10000)
            
            # Add to portfolio simulation
            portfolio_simulated_returns += (position_value * simulated_security_returns)

        # Calculate percentiles for VaR
        var_95 = np.percentile(portfolio_simulated_returns, 5)
        var_99 = np.percentile(portfolio_simulated_returns, 1)

        return {
            "totalPortfolioValue": round(total_portfolio_value, 2),
            "var95": round(abs(var_95), 2),
            "var99": round(abs(var_99), 2),
            "message": "Calculated using 10,000 Monte Carlo paths backed by G8.EOD_Prices."
        }
    except Exception as ex:
        raise HTTPException(status_code=500, detail=f"Risk calculation failed: {str(ex)}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)