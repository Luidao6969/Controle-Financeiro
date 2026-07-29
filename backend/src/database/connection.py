import psycopg2
from psycopg2.extras import RealDictCursor

def get_connection():
    return psycopg2.connect(
        host="localhost",
        database="Contabilidade",
        user="postgres",
        password="123456",
        cursor_factory=RealDictCursor
    )