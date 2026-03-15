from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.database import Base


class User(Base):

    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=True)
    role = Column(String, nullable=False)

    phone = Column(String, nullable=True)

    external_email_allowed = Column(Boolean, default=False)

    orders = relationship("Order", back_populates="user")


class College(Base):

    __tablename__ = "colleges"

    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True, nullable=False)

    allowed_domains = Column(String, nullable=False)
    allow_external_emails = Column(Boolean, default=False)

    canteens = relationship("Canteen", back_populates="college")


class Canteen(Base):

    __tablename__ = "canteens"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)

    college_id = Column(Integer, ForeignKey("colleges.id"))
    college = relationship("College", back_populates="canteens")

    vendor_email = Column(String, nullable=False)
    vendor_phone = Column(String, nullable=False)

    image_url = Column(String)
    status = Column(String, default="open")
    rating = Column(Float, default=0)

    orders = relationship("Order", back_populates="canteen")
    menu_items = relationship("MenuItem", back_populates="canteen")


class MenuItem(Base):

    __tablename__ = "menu_items"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    price = Column(Integer, nullable=False)

    image_url = Column(String)

    canteen_id = Column(Integer, ForeignKey("canteens.id"))
    canteen = relationship("Canteen", back_populates="menu_items")


class Order(Base):

    __tablename__ = "orders"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    canteen_id = Column(Integer, ForeignKey("canteens.id"))
    status = Column(String, default="placed")
    total_amount = Column(Float, default=0)
    phone = Column(String)
    address = Column(String)
    token = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
    reject_reason = Column(String, nullable=True)
    student_note = Column(String, nullable=True)

    user = relationship("User")
    canteen = relationship("Canteen")

    items = relationship("OrderItem", back_populates="order")


class OrderItem(Base):

    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True)

    quantity = Column(Integer)

    order_id = Column(Integer, ForeignKey("orders.id"))
    menu_item_id = Column(Integer, ForeignKey("menu_items.id"))

    order = relationship("Order", back_populates="items")
    menu_item = relationship("MenuItem")


class CanteenRating(Base):

    __tablename__ = "canteen_ratings"

    id = Column(Integer, primary_key=True)

    user_id = Column(Integer, ForeignKey("users.id"))
    canteen_id = Column(Integer, ForeignKey("canteens.id"))

    rating = Column(Integer)

    created_at = Column(DateTime, default=datetime.utcnow)