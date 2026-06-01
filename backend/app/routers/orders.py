from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.models import Order, OrderItem, Product, Customer, OrderStatus
from app.schemas.schemas import OrderCreate, OrderUpdate, Order as OrderSchema

router = APIRouter()

@router.get("/", response_model=List[OrderSchema])
def get_orders(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(Order).offset(skip).limit(limit).all()

@router.get("/{order_id}", response_model=OrderSchema)
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@router.post("/", response_model=OrderSchema, status_code=201)
def create_order(order: OrderCreate, db: Session = Depends(get_db)):
    # Validate customer exists
    customer = db.query(Customer).filter(Customer.id == order.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    # Validate stock for all items first
    for item in order.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
        if product.stock < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for '{product.name}'. Available: {product.stock}, Requested: {item.quantity}"
            )

    # Create order (default status: confirmed)
    order_status = OrderStatus(order.status.value) if order.status else OrderStatus.confirmed
    db_order = Order(customer_id=order.customer_id, total_amount=0.0, status=order_status)
    db.add(db_order)
    db.flush()

    total = 0.0
    for item in order.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        order_item = OrderItem(
            order_id=db_order.id,
            product_id=item.product_id,
            quantity=item.quantity,
            unit_price=product.price
        )
        # Reduce stock automatically
        product.stock -= item.quantity
        total += product.price * item.quantity
        db.add(order_item)

    db_order.total_amount = total
    db.commit()
    db.refresh(db_order)
    return db_order

@router.put("/{order_id}", response_model=OrderSchema)
def update_order(order_id: int, order: OrderUpdate, db: Session = Depends(get_db)):
    db_order = db.query(Order).filter(Order.id == order_id).first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.status is not None:
        db_order.status = OrderStatus(order.status.value)
    db.commit()
    db.refresh(db_order)
    return db_order

@router.delete("/{order_id}")
def delete_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    db.delete(order)
    db.commit()
    return {"message": "Order deleted successfully"}
