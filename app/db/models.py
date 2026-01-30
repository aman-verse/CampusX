from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.database import Base


# ---------- USERS ----------
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)

    # Nullable because of Google login
    password = Column(String, nullable=True)

    role = Column(String, nullable=False)

    orders = relationship("Order", back_populates="user")

# ---------- COLLEGES ----------
class College(Base):
    __tablename__ = "colleges"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)
    allowed_domains = Column(String, nullable=False)
    allow_external_emails = Column(Boolean, default=False)

# ---------- CANTEENS ----------
class Canteen(Base):
    __tablename__ = "canteens"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)

    college_id = Column(Integer, ForeignKey("colleges.id"), nullable=False)

    # WhatsApp number lives HERE
    vendor_phone = Column(String, nullable=False)

    orders = relationship("Order", back_populates="canteen")
    menu_items = relationship("MenuItem", back_populates="canteen")


# ---------- MENU ITEMS ----------
class MenuItem(Base):
    __tablename__ = "menu_items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    price = Column(Integer, nullable=False)

    canteen_id = Column(Integer, ForeignKey("canteens.id"), nullable=False)
    canteen = relationship("Canteen", back_populates="menu_items")


# ---------- ORDERS ----------
class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    status = Column(String, default="placed")
    created_at = Column(DateTime, default=datetime.utcnow)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    canteen_id = Column(Integer, ForeignKey("canteens.id"), nullable=False)

    user = relationship("User", back_populates="orders")
    canteen = relationship("Canteen", back_populates="orders")

    items = relationship("OrderItem", back_populates="order")


# ---------- ORDER ITEMS ----------
class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    quantity = Column(Integer, nullable=False)

    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    menu_item_id = Column(Integer, ForeignKey("menu_items.id"), nullable=False)

    order = relationship("Order", back_populates="items")


# ---------- VENDOR ↔ CANTEEN MAP ----------
class VendorCanteen(Base):
    __tablename__ = "vendor_canteen"

    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    canteen_id = Column(Integer, ForeignKey("canteens.id"), primary_key=True)
