"""
Simple test script to verify the vector query syntax fix.
"""
import asyncio
import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL")

async def test_vector_query():
    """Test the vector query with the fixed syntax."""
    print("\n=== Testing Vector Query Syntax ===")
    
    # Sample embedding (just a list of floats)
    embedding = [0.1, 0.2, 0.3, 0.4, 0.5]
    
    # For pgvector, we need to keep the original format with square brackets
    embedding_str = str(embedding)  # Keep the original format with square brackets
    
    # Create database engine
    engine = create_engine(DATABASE_URL)
    
    # Connect to database
    with engine.connect() as conn:
        try:
            # Test query with direct string formatting for vector
            query = f"""
                SELECT 
                    id,
                    embedding <=> '{embedding_str}'::vector AS distance
                FROM 
                    tg_messages
                WHERE
                    embedding IS NOT NULL
                LIMIT 1
            """
            
            # Execute query
            result = conn.execute(text(query))
            row = result.fetchone()
            
            if row:
                print(f"Query successful! Found message with id: {row.id}, distance: {row.distance}")
            else:
                print("Query successful but no results found.")
                
            print("\n=== Vector Query Syntax Test Passed ===")
            return True
            
        except Exception as e:
            print(f"Error executing vector query: {str(e)}")
            print("\n=== Vector Query Syntax Test Failed ===")
            return False

if __name__ == "__main__":
    asyncio.run(test_vector_query())
