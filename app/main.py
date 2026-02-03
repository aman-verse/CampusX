from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import engine
from app.db import models
from app.routers import auth,users,orders,canteens,menu,admin,auth_google,colleges

app = FastAPI()

# create tables
models.Base.metadata.create_all(bind=engine)

@app.get("/")
def root():
    return {"message": "Campus Food Delivery API running"}

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "https://campusx-43j7.onrender.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def coop_headers(request, call_next):
    response = await call_next(request)
    response.headers["Cross-Origin-Opener-Policy"] = "same-origin-allow-popups"
    response.headers["Cross-Origin-Embedder-Policy"] = "unsafe-none"
    return response


app.include_router(auth.router)
app.include_router(users.router)
app.include_router(orders.router)
app.include_router(canteens.router)
app.include_router(menu.router)
app.include_router(admin.router)
app.include_router(auth_google.router)
app.include_router(colleges.router)

