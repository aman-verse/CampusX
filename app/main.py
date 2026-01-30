from fastapi import FastAPI

from app.db.database import engine
from app.db import models
from app.routers import auth,users,orders,canteens,menu,admin,auth_google,colleges

app = FastAPI()

    
# create tables
models.Base.metadata.create_all(bind=engine)

@app.get("/")
def root():
    return {"message": "Campus Food Delivery API running"}

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(orders.router)
app.include_router(canteens.router)
app.include_router(menu.router)
app.include_router(admin.router)
app.include_router(auth_google.router)
app.include_router(colleges.router)

