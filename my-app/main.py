import mysql.connector
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from http.client import HTTPException

app = FastAPI()
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create a connection to the database
conn = mysql.connector.connect(
    database=os.getenv("MYSQL_DATABASE"),
    user=os.getenv("MYSQL_USER"),
    password=os.getenv("MYSQL_ROOT_PASSWORD"),
    port=3306,
    host=os.getenv("MYSQL_HOST"),
)

class UserCreate(BaseModel):
    firstName: str
    lastName: str
    email: str
    birthDate: str
    zip: str
    city: str

@app.get("/users")
async def get_users():
    cursor = conn.cursor(dictionary=True)
    sql_select_Query = "select * from utilisateur"
    cursor.execute(sql_select_Query)
    # get all records
    records = cursor.fetchall()
    print("Total number of rows in table: ", cursor.rowcount)
    # renvoyer nos données et 200 code OK
    return {'utilisateurs': records}

@app.post("/users", status_code=201)
async def create_user(user: UserCreate):
    cursor = conn.cursor(dictionary=True)

    check_query = "SELECT id, email FROM utilisateur WHERE email = %s"
    cursor.execute(check_query, (user.email,))
    existing_user = cursor.fetchone()

    if existing_user:
        cursor.close()
        raise HTTPException(status_code=400, detail="Email déjà utilisé")

    full_name = f"{user.firstName} {user.lastName}".strip()

    insert_query = """
        INSERT INTO utilisateur (name, email, birthDate, zip, city)
        VALUES (%s, %s, %s, %s, %s)
    """
    values = (full_name, user.email, user.birthDate, user.zip, user.city)

    cursor.execute(insert_query, values)
    conn.commit()

    created_id = cursor.lastrowid
    cursor.close()

    return {
        "id": created_id,
        "name": full_name,
        "email": user.email,
        "birthDate": user.birthDate,
        "zip": user.zip,
        "city": user.city,
    }