import urllib.parse

def build_whatsapp_url(phone, order_id, token, student_name, student_phone, address, items, total):
    msg = f"🍽️ New Order #{order_id}\n\n"
    msg += f"Token: {token}\n\n"
    msg += f"Student: {student_name}\n"
    msg += f"Phone: {student_phone}\n\n"
    msg += f"Address: {address}\n\n"
    msg += "Items:\n"

    for i in items:
        msg += f"{i['name']} × {i['qty']}  — ₹{i['price']}\n"

    msg += f"\nTotal: ₹{total}\n\n"
    msg += f"Accept Order:\nhttps://campusx.com/vendor/orders/{order_id}/accept\n\n"
    msg += f"Reject Order:\nhttps://campusx.com/vendor/orders/{order_id}/reject"

    encoded = urllib.parse.quote(msg)

    return f"https://wa.me/91{phone}?text={encoded}"