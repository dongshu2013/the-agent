import os
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from pathlib import Path
from dotenv import load_dotenv

def execute_sql_file(conn, file_path):
    with open(file_path, 'r') as f:
        sql = f.read()
    with conn.cursor() as cur:
        cur.execute(sql)
    conn.commit()

def list_tables(conn):
    with conn.cursor() as cur:
        cur.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        """)
        tables = cur.fetchall()
        print("\nCurrent tables in database:")
        for table in tables:
            print(f"- {table[0]}")

def main():
    # 加载环境变量
    load_dotenv()
    
    # 使用 Railway 的公共数据库 URL
    db_url = "postgresql://postgres:USOixMMHhiZeoKOXUIMCPoUMIiZzXodQ@switchback.proxy.rlwy.net:48726/railway"
    
    print("Connecting to database...")
    # 连接到数据库
    conn = psycopg2.connect(db_url)
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    print("Connected successfully!")

    try:
        # 列出当前的表
        list_tables(conn)

        # 获取迁移文件路径
        migrations_dir = Path(__file__).parent.parent / 'models' / 'migrations'
        
        # 只执行创建表的 SQL
        migration_files = [
            'create_message_embeddings.sql'
        ]
        
        for file_name in migration_files:
            file_path = migrations_dir / file_name
            if file_path.exists():
                print(f"\nExecuting {file_name}...")
                execute_sql_file(conn, file_path)
                print(f"Successfully executed {file_name}")
            else:
                print(f"Warning: {file_name} not found")

        # 再次列出表以确认更改
        print("\nTables after migration:")
        list_tables(conn)

    except Exception as e:
        print(f"Error during migration: {str(e)}")
        raise
    finally:
        conn.close()
        print("\nDatabase connection closed.")

if __name__ == "__main__":
    main() 