from sqlalchemy import create_engine, inspect, MetaData, text
from sqlalchemy.engine import URL
import os
from dotenv import load_dotenv
import json

def get_column_type(column):
    """Convert PostgreSQL column type to SQLAlchemy type"""
    pg_type = str(column['type']).lower()
    if 'boolean' in pg_type:
        return 'Boolean'
    elif 'array' in pg_type:
        return 'ARRAY'
    elif 'character varying' in pg_type:
        return 'String'
    elif 'timestamp' in pg_type:
        return 'DateTime'
    elif 'bigint' in pg_type:
        return 'BigInteger'
    elif 'numeric' in pg_type:
        return 'Numeric'
    elif 'jsonb' in pg_type or 'json' in pg_type:
        return 'JSON'
    elif 'vector' in pg_type or column['name'] == 'embedding':
        return 'Vector(1024)'
    else:
        return 'String'  # Default to String for unknown types

def generate_model_code(table_name, columns, primary_keys, foreign_keys, indexes, inspector):
    """Generate SQLAlchemy model code for a table"""
    class_name = ''.join(word.title() for word in table_name.split('_'))
    
    lines = [
        f"class {class_name}(Base):",
        f"    __tablename__ = \"{table_name}\"",
        ""
    ]
    
    # Add columns
    for col in columns:
        nullable = "" if not col['nullable'] else ", nullable=True"
        default = ""
        
        # Handle primary key
        if col['name'] in primary_keys:
            default = ", primary_key=True, default=generate_uuid"
        # Handle other defaults
        elif col.get('default'):
            if 'uuid' in str(col['default']):
                default = ", default=generate_uuid"
            elif 'now' in str(col['default']):
                default = ", default=func.now()"
            elif str(col['default']) == 'true':
                default = ", default=True"
            elif str(col['default']) == 'false':
                default = ", default=False"
            elif str(col['default']).isdigit():
                default = f", default={col['default']}"
        # Add default for created_at and updated_at
        elif col['name'] == 'created_at':
            default = ", default=func.now()"
        elif col['name'] == 'updated_at':
            default = ", default=func.now(), onupdate=func.now()"
        
        # Handle foreign keys
        fk = next((fk for fk in foreign_keys if col['name'] in fk['constrained_columns']), None)
        if fk:
            ref_table = fk['referred_table']
            lines.append(f"    {col['name']} = Column({get_column_type(col)}, ForeignKey(\"{ref_table}.{fk['referred_columns'][0]}\"){nullable}{default})")
        else:
            lines.append(f"    {col['name']} = Column({get_column_type(col)}{nullable}{default})")
    
    # Add relationships
    relationships = {}
    # First, add relationships for foreign keys in this table
    for fk in foreign_keys:
        ref_table = fk['referred_table']
        ref_class = ''.join(word.title() for word in ref_table.split('_'))
        relationships[ref_table] = f'    {ref_table} = relationship("{ref_class}", back_populates="{table_name}")'
    
    # Then, add back-references from other tables
    for other_table in inspector.get_table_names():
        if other_table == '_prisma_migrations':
            continue
        other_fks = inspector.get_foreign_keys(other_table)
        for fk in other_fks:
            if fk['referred_table'] == table_name:
                other_name = other_table
                other_class = ''.join(word.title() for word in other_table.split('_'))
                cascade = ', cascade="all, delete-orphan"'
                relationships[other_name] = f'    {other_name} = relationship("{other_class}", back_populates="{table_name}"{cascade})'
    
    if relationships:
        lines.append("")
        lines.append("    # Relationships")
        lines.extend(sorted(relationships.values()))
    
    lines.append("")
    lines.append("    def __repr__(self):")
    lines.append(f"        return f\"<{class_name}(id={{self.id}})>\"")
    
    return "\n".join(lines)

def sync_database_schema():
    """Sync database schema and generate SQLAlchemy models"""
    # Create engine directly from URL
    engine = create_engine("postgresql://postgres:L.YapvRakYjnqzaLjSpw5bm_hcdpil1V@turntable.proxy.rlwy.net:54789/railway")
    inspector = inspect(engine)
    
    # Get all tables
    tables = inspector.get_table_names()
    print(f"Found tables: {tables}")
    print()
    
    # Generate header for database.py
    header = """from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, JSON, BigInteger, Numeric
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from sqlalchemy.dialects.postgresql import ARRAY
from pgvector.sqlalchemy import Vector

from edge_agent.utils.database import Base

def generate_uuid():
    return str(uuid.uuid4())
"""
    
    models = []
    
    # Process each table
    for table_name in tables:
        if table_name == '_prisma_migrations':
            continue
            
        print(f"Syncing table: {table_name}")
        
        # Get table info
        columns = inspector.get_columns(table_name)
        primary_keys = inspector.get_pk_constraint(table_name)['constrained_columns']
        foreign_keys = inspector.get_foreign_keys(table_name)
        indexes = inspector.get_indexes(table_name)
        
        print(f"Columns: {[col['name'] for col in columns]}")
        print(f"Primary keys: {primary_keys}")
        print(f"Foreign keys: {[fk['constrained_columns'] for fk in foreign_keys]}")
        print(f"Indexes: {[idx['name'] for idx in indexes]}")
        print()
        
        # Generate model code
        model_code = generate_model_code(table_name, columns, primary_keys, foreign_keys, indexes, inspector)
        models.append(model_code)
    
    # Write to database.py
    with open('edge_agent/models/database.py', 'w') as f:
        f.write(header)
        f.write('\n\n')
        f.write('\n\n'.join(models))

if __name__ == '__main__':
    sync_database_schema() 