import urllib.parse

def build_whatsapp_url(phone: str, order_id: int, items: list):
    msg = f"New Order #{order_id}\n\n"
    for i in items:
        msg += f"- Item {i.menu_item_id} x {i.quantity}\n"

    return f"https://wa.me/91{phone}?text={urllib.parse.quote(msg)}"
