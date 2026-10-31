import mysql.connector

def get_connection():
    return mysql.connector.connect(
        host="mysql-db",
        user="root",
        password="StrongPassword@123",
        database="todo_db"
    )
